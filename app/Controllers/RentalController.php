<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\I18n\Time;

class RentalController extends ResourceController
{
    protected $modelName = 'App\Models\RentalModel';
    protected $format    = 'json';

    private $vehicleModel;

    public function __construct()
    {
        $this->vehicleModel = new \App\Models\VehicleModel();
    }

    public function create()
    {
        $data = $this->request->getJSON();

        //pega id da request vinda do filter
        $user = $this->request->user ?? null;
        if (!$user || !isset($user->uid)) {
            return $this->failUnauthorized('Usuário não autenticado.');
        }

        $veiculo = $this->vehicleModel->getVehicle($data->veiculo_id);

        if (!$veiculo) {
            return $this->failNotFound('Veículo não encontrado.');
        }

        if ($veiculo['status'] !== 'disponivel') {
            return $this->fail('Este veículo não está disponível para locação.', 409);
        }

        try {
            $retirada = Time::parse($data->data_retirada);
            $devolucao = Time::parse($data->data_devolucao_prevista);

            $diff = $retirada->difference($devolucao);
            $dias = $diff->getDays();

            if ($dias < 1) {
                $dias = 1;
            }

            // verificar se há conflito de datas para o mesmo veículo
            $conflitoDatas = $this->model->where('veiculo_id', $data->veiculo_id)
                ->where('status !=', 'cancelado')
                ->where('status !=', 'finalizado')
                ->groupStart()
                    ->where('data_retirada <=', $data->data_devolucao_prevista)
                    ->where('data_devolucao_prevista >=', $data->data_retirada)
                ->groupEnd()
                ->first();

            if ($conflitoDatas) {
                return $this->fail('Veículo já está reservado/alugado para este período.', 409);
            }
        } catch (\Exception $e) {
            return $this->fail('Datas inválidas: ' . $e->getMessage());
        }

        //cálculo do valor previsto
        $meses = intdiv($dias, 30);
        $resto = $dias % 30;
        $semanas = intdiv($resto, 7);
        $dias_avulsos = $resto % 7;

        $valor_previsto = ($meses * $veiculo['valor_mensal']) +
            ($semanas * $veiculo['valor_semanal']) +
            ($dias_avulsos * $veiculo['valor_diario']);

        $novoAluguel = [
            'user_id'                 => (int)$user->uid, //id do token
            'veiculo_id'              => (int)$data->veiculo_id,
            'valor_diario_praticado'  => (float)$veiculo['valor_diario'],
            'data_retirada'           => $data->data_retirada,
            'data_devolucao_prevista' => $data->data_devolucao_prevista,
            'valor_previsto'          => (float)$valor_previsto,
            'km_inicial'              => null,
            'status'                  => 'reservado'
        ];

        if ($this->model->insert($novoAluguel)) {
            return $this->respondCreated([
                'message' => 'Reserva realizada com sucesso.',
                'valor_previsto' => $valor_previsto,
                'dias' => $dias
            ]);
        }

        $errors = $this->model->errors();
        return $this->fail('Erro ao criar aluguel: ' . json_encode($errors), 400);
    }

    public function start($id = null)
    {
        $reserva = $this->model->find($id);

        if (!$reserva || $reserva['status'] !== 'reservado') {
            return $this->failNotFound('Reserva não encontrada ou status inválido para início.');
        }

        $veiculo = $this->vehicleModel->find($reserva['veiculo_id']);

        if ($veiculo['status'] !== 'disponivel') {
            return $this->fail('O veículo designado não está disponível agora.', 409);
        }

        $agora = Time::now();
        $dataPrevista = Time::parse($reserva['data_retirada']);
        $inicioPermitido = $dataPrevista->subMinutes(15);

        if ($agora->isBefore($inicioPermitido)) {
            return $this->fail('A retirada só pode ser realizada até 15 minutos antes do horário previsto.', 409);
        }

        $db = \Config\Database::connect();
        $db->transStart();

        $this->model->update($id, [
            'status'        => 'ativo',
            'km_inicial'    => $veiculo['km_atual'],
            'data_retirada' => date('Y-m-d H:i:s')
        ]);

        $this->vehicleModel->update($veiculo['id'], ['status' => 'alugado']);

        $db->transComplete();

        return $this->respond(['message' => 'Locação iniciada.']);
    }

    public function finish($id = null)
    {
        $aluguel = $this->model->find($id);

        if (!$aluguel || $aluguel['status'] !== 'ativo') {
            return $this->failNotFound('Locação não encontrada ou já finalizada.');
        }

        $data = $this->request->getJSON();

        if (!isset($data->km_final) || $data->km_final < $aluguel['km_inicial']) {
            return $this->fail('KM final inválido. Deve ser maior que o inicial.');
        }

        // calcular multa
        $devolucao_prevista = Time::parse($aluguel['data_devolucao_prevista']);
        $devolucao_real = Time::now();

        $valor_total = $aluguel['valor_previsto'];

        if ($devolucao_real->isAfter($devolucao_prevista)) {
            $diff = $devolucao_prevista->difference($devolucao_real);

            $minutos_atraso = $diff->getMinutes();
            $dias_atraso = $diff->getDays();

            if ($dias_atraso == 0 && $minutos_atraso > 15) { // tolerância de 15min
                $dias_atraso = 1;
            }

            if ($dias_atraso > 0) {
                // diária dobrada em atrasos
                $multa = $dias_atraso * ($aluguel['valor_diario_praticado'] * 2);
                $valor_total += $multa;
            }
        }

        $db = \Config\Database::connect();
        $db->transStart();

        $this->model->update($id, [
            'data_devolucao_real' => date('Y-m-d H:i:s'),
            'km_final'            => $data->km_final,
            'valor_total'         => $valor_total,
            'status'              => 'finalizado'
        ]);

        $this->vehicleModel->update($aluguel['veiculo_id'], [
            'status'   => 'disponivel',
            'km_atual' => $data->km_final
        ]);

        $db->transComplete();

        $response = [
            'message' => 'Veículo devolvido com sucesso.',
            'valor_total' => $valor_total
        ];

        return $this->respond($response);
    }

    public function cancel($id = null)
    {
        $aluguel = $this->model->find($id);

        if (!$aluguel || $aluguel['status'] !== 'reservado') {
            return $this->failNotFound('Locação não encontrada ou não pode ser cancelada.');
        }

        // verifica horas para retirada
        $dataRetirada = Time::parse($aluguel['data_retirada']);
        $agora = Time::now();

        $diffHoras = $agora->difference($dataRetirada)->getHours();

        if ($agora->isAfter($dataRetirada) || $diffHoras < 24) {
            return $this->fail('Cancelamento é permitido com pelo menos 24 horas de antecedência.', 409);
        }

        $this->model->update($id, [
            'status' => 'cancelado'
        ]);

        return $this->respond(['message' => 'Locação cancelada com sucesso.']);
    }

    public function show($id = null)
    {
        $aluguel = $this->model->find($id);
        if (!$aluguel) {
            return $this->failNotFound('Locação não encontrada.');
        }

        return $this->respond($aluguel);
    }

    public function index()
    {
        return $this->respond($this->model->findAll());
    }

    public function myRentals()
    {
        $user = $this->request->user ?? null;

        if (!$user || !isset($user->uid)) {
            return $this->failUnauthorized('Usuário não autenticado.');
        }

        $rentals = $this->model->where('user_id', $user->uid)->findAll();

        return $this->respond([
            'data' => $rentals,
            'message' => 'Suas locações'
        ]);
    }
}
