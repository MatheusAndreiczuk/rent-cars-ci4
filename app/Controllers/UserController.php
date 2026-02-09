<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format    = 'json';

    public function index()
    {
        return $this->respond($this->model->findAll());
    }

    public function show($id = null)
    {
        $user = $this->model->find($id);
        if (!$user) {
            return $this->failNotFound('Usuário não encontrado.');
        }

        return $this->respond($user);
    }

    public function create()
    {
        $data = $this->request->getJSON();

        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'id'      => $this->model->getInsertID(),
                'message' => 'Usuário criado com sucesso.'
            ]);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    public function update($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('Usuário não encontrado.');
        }

        $data = $this->request->getJSON();

        if ($this->model->updateUser($id, $data)) {
            return $this->respond(['message' => 'Usuário atualizado com sucesso.']);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    public function delete($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('Usuário não encontrado.');
        }

        if ($this->model->delete($id)) {
            return $this->respondDeleted(['message' => 'Usuário removido com sucesso.']);
        }

        return $this->failServerError('Erro ao deletar usuário.');
    }
}