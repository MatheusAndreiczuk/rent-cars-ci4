<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use Faker\Factory;

class RentalSeeder extends Seeder
{
    public function run()
    {
        $faker = Factory::create('pt_BR');
        $data = [];

        $users = $this->db->table('users')->where('role', 'client')->get()->getResultArray();
        $vehicles = $this->db->table('vehicles')->get()->getResultArray();
        $categories = $this->db->table('category')->get()->getResultArray();

        if (empty($users) || empty($vehicles) || empty($categories)) {
            echo "Erro: Dados insuficientes nas tabelas users, vehicles ou category.\n";
            return;
        }

        for ($i = 0; $i < 50; $i++) {
            $vehicle = $faker->randomElement($vehicles);
            $user = $faker->randomElement($users);
            $category = $this->getCategoryById($categories, $vehicle['id_categoria']);

            $status = $faker->randomElement(['reservado', 'ativo', 'finalizado', 'cancelado']);

            if ($status === 'finalizado' || $status === 'cancelado') {
                $dataRetirada = $faker->dateTimeBetween('-4 months', '-1 month');
                $dataDevolucaoPrevista = (clone $dataRetirada)->modify('+' . $faker->numberBetween(1, 25) . ' days');
            } elseif ($status === 'ativo') {
                $dataRetirada = $faker->dateTimeBetween('-10 days', 'now');
                $dataDevolucaoPrevista = $faker->dateTimeBetween('+1 day', '+2 months');
            } else { 
                $dataRetirada = $faker->dateTimeBetween('+1 day', '+1 month');
                $dataDevolucaoPrevista = (clone $dataRetirada)->modify('+' . $faker->numberBetween(1, 15) . ' days');
            }

            $dataDevolucaoPrevista = (clone $dataRetirada)->modify('+' . $faker->numberBetween(1, 60) . ' days');

            $intervalo = $dataRetirada->diff($dataDevolucaoPrevista);
            $diasTotal = $intervalo->days > 0 ? $intervalo->days : 1;

            $meses       = intdiv($diasTotal, 30);
            $resto       = $diasTotal % 30;
            $semanas     = intdiv($resto, 7);
            $diasAvulsos = $resto % 7;

            $vMensal  = $category['valor_mensal'];
            $vSemanal = $category['valor_semanal'];
            $vDiario  = $category['valor_diario'];

            $valorPrevisto = ($meses * $vMensal) + ($semanas * $vSemanal) + ($diasAvulsos * $vDiario);

            $dataDevolucaoReal = null;
            $valorTotal = null;
            $kmInicial = $vehicle['km_atual'];
            $kmFinal = null;

            if ($status === 'finalizado') {
                $dataDevolucaoReal = (clone $dataDevolucaoPrevista)->modify($faker->randomElement(['-1 day', '+0 days', '+2 days']));
                $kmFinal = $kmInicial + $faker->numberBetween(100, 3000);
                $valorTotal = $valorPrevisto;
            }

            $data[] = [
                'user_id'                 => $user['id'],
                'veiculo_id'              => $vehicle['id'],
                'valor_diario_praticado'  => $vDiario,
                'data_retirada'           => $dataRetirada->format('Y-m-d H:i:s'),
                'data_devolucao_prevista' => $dataDevolucaoPrevista->format('Y-m-d H:i:s'),
                'data_devolucao_real'     => $dataDevolucaoReal ? $dataDevolucaoReal->format('Y-m-d H:i:s') : null,
                'valor_previsto'          => $valorPrevisto,
                'valor_total'             => $valorTotal,
                'km_inicial'              => $kmInicial,
                'km_final'                => $kmFinal,
                'status'                  => $status,
                'created_at'              => date('Y-m-d H:i:s'),
                'updated_at'              => date('Y-m-d H:i:s'),
            ];
        }

        $this->db->table('rentals')->insertBatch($data);
    }

    private function getCategoryById($categories, $id)
    {
        foreach ($categories as $category) {
            if ($category['id'] == $id) return $category;
        }
        return null;
    }
}
