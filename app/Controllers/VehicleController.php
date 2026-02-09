<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class VehicleController extends ResourceController
{
    private $vehicleModel;
    private $categoryModel;
    public function __construct()
    {
        $this->vehicleModel = new \App\Models\VehicleModel();
        $this->categoryModel = new \App\Models\CategoryModel();
    }

    public function create()
    {
        $response = [];
        $newVehicleData = (array) $this->request->getJSON();

        if (isset($newVehicleData['categoria'])) {
            $categoria = $this->categoryModel->where('nome', $newVehicleData['categoria'])->first();
            if ($categoria && isset($categoria['id'])) {
                $newVehicleData['id_categoria'] = $categoria['id'];
            } else {
                $response = [
                    'error_messages' => ['Categoria não encontrada.']
                ];
                return $this->respond($response, 400);
            }
            unset($newVehicleData['categoria']);
        }

        if ($this->vehicleModel->insert($newVehicleData)) {
            $response = [
                'message' => [
                    'success' => 'Veículo criado com sucesso.'
                ]
            ];
        } else {
            $response = [
                'error_messages' => $this->vehicleModel->errors()
            ];
        }

        return $this->respond($response);
    }

    public function getVehicle($id)
    {
        $vehicle = $this->vehicleModel->find($id);
        $response = [];
        if ($vehicle) {
            $response = [
                'data' => $vehicle
            ];
        } else {
            $response = [
                'message' => [
                    'error' => 'Veículo não encontrado.'
                ]
            ];
        }

        return $this->respond($response);
    }

    public function getAllVehicles()
    {
        $vehicles = $this->vehicleModel->findAll();
        $response = [
            'data' => $vehicles
        ];
        return $this->respond($response);
    }

    public function update($id = null)
    {
        $response = [];
        $vehicleData = (array) $this->request->getJSON();

        if (isset($vehicleData['categoria'])) {
            $categoria = $this->categoryModel->where('nome', $vehicleData['categoria'])->first();
            if ($categoria && isset($categoria['id'])) {
                $vehicleData['id_categoria'] = $categoria['id'];
            } else {
                $response = [
                    'error_messages' => ['Categoria não encontrada.']
                ];
                return $this->respond($response, 400);
            }
            unset($vehicleData['categoria']);
        }

        $this->vehicleModel->setValidationRule('placa', 'required|is_unique[vehicles.placa,id,' . $id . ']|exact_length[7]');

        if ($this->vehicleModel->update($id, $vehicleData)) {
            $response = [
                'message' => [
                    'success' => 'Veículo atualizado com sucesso.'
                ]
            ];
        } else {
            $response = [
                'error_messages' => $this->vehicleModel->errors()
            ];
        }

        return $this->respond($response);
    }

    public function delete($id = null)
    {
        $response = [];
        if ($this->vehicleModel->delete($id)) {
            $response = [
                'message' => [
                    'success' => 'Veículo deletado com sucesso.'
                ]
            ];
        } else {
            $response = [
                'message' => [
                    'error' => 'Erro ao deletar veículo.'
                ]
            ];
        }

        return $this->respond($response);
    }
}
