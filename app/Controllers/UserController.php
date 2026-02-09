<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new \App\Models\UserModel();
    }

    public function create()
    {
        $response = [];
        $newUserData = $this->request->getJSON();
        if ($this->userModel->insert($newUserData)) {
            $response = [
                'message' => [
                    'success' => 'Usuário criado com sucesso.'
                ]
            ];
        } else {
            $response = [
                'error_messages' => $this->userModel->errors()
            ];
        }

        return $this->respond($response);
    }

    public function getUser($id)
    {
        $user = $this->userModel->find($id);
        $response = [];
        if ($user) {
            $response = [
                'data' => $user
            ];
        } else {
            $response = [
                'message' => [
                    'error' => 'Usuário não encontrado.'
                ]
            ];
        }

        return $this->respond($response);
    }

    public function getAllUsers()
    {
        $response = [];
        $users = $this->userModel->findAll();
        if ($users) {
            $response = [
                'data' => $users
            ];
        } else {
            $response = [
                'message' => [
                    'error' => 'Nenhum usuário encontrado.'
                ]
            ];
        }

        return $this->respond($response);
    }

    public function update($id = null)
    {
        $response = [];
        $userData = $this->request->getJSON();

        $this->userModel->setValidationRule('cpf', 'required|is_unique[users.cpf,id,' . $id . ']|exact_length[11]');
        $this->userModel->setValidationRule('email', 'required|valid_email|is_unique[users.email,id,' . $id . ']');
        $this->userModel->setValidationRule('cnh_numero', 'required|is_unique[users.cnh_numero,id,' . $id . ']');

        if ($this->userModel->update($id, $userData)) {
            $response = [
                'message' => [
                    'success' => 'Usuário atualizado com sucesso.'
                ]
            ];
        } else {
            $response = [
                'error_messages' => $this->userModel->errors()
            ];
        }

        return $this->respond($response);
    }

    public function delete($id = null)
    {
        $response = [];
        if ($this->userModel->delete($id)) {
            $response = [
                'message' => [
                    'success' => 'Usuário deletado com sucesso.'
                ]
            ];
        } else {
            $response = [
                'message' => [
                    'error' => 'Erro ao deletar usuário.'
                ]
            ];
        }

        return $this->respond($response);
    }
}
