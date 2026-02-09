<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class VehicleController extends ResourceController
{
    protected $modelName = 'App\Models\VehicleModel';
    protected $format    = 'json';

    public function index()
    {
        $data = $this->model->getVehicle();
        return $this->respond($data);
    }

    public function show($id = null)
    {
        $vehicle = $this->model->getVehicle($id);

        if (!$vehicle) {
            return $this->failNotFound('Veículo não encontrado.');
        }

        return $this->respond($vehicle);
    }

    public function create()
    {
        $data = $this->request->getJSON();

        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'message' => 'Veículo criado com sucesso.'
            ]);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    public function update($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('Veículo não encontrado.');
        }

        $data = $this->request->getJSON();

        if ($this->model->updateVehicle($id, $data)) {
            return $this->respond(['message' => 'Veículo atualizado com sucesso.']);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    public function delete($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('Veículo não encontrado.');
        }

        if ($this->model->delete($id)) {
            return $this->respondDeleted(['message' => 'Veículo deletado com sucesso.']);
        }

        return $this->failServerError('Erro ao deletar veículo.');
    }
}