<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format    = 'json';

    public function index()
    {
        $users = $this->model->findAll();
        //percorre o array de usuarios do bd e remove a senha de cada um, depois retorna o array sem as senhas para a própria variavel $users
        $users = array_map(function($user) {
            return $this->model->removeSenha($user);
        }, $users);
        return $this->respond($users);
    }

    public function show($id = null)
    {
        $user = $this->model->find($id);
        if (!$user) {
            return $this->failNotFound('Usuário não encontrado.');
        }

        $authUser = $this->request->user ?? null;
        if ($authUser && isset($authUser->role)) {
            if ($authUser->role !== 'admin' && $authUser->uid != $id) {
                return $this->failForbidden('Você só pode visualizar sua própria conta.');
            }
        }

        $user = $this->model->removeSenha($user);
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

        $user = $this->request->user ?? null;
        if ($user && isset($user->role)) {
            if ($user->role !== 'admin' && $user->uid != $id) {
                return $this->failForbidden('Você só pode editar sua própria conta.');
            }
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

        $user = $this->request->user ?? null;
        if ($user && isset($user->role)) {
            if ($user->role !== 'admin' && $user->uid != $id) {
                return $this->failForbidden('Você só pode deletar sua própria conta.');
            }
        }

        if ($this->model->delete($id)) {
            return $this->respondDeleted(['message' => 'Usuário removido com sucesso.']);
        }

        return $this->failServerError('Erro ao deletar usuário.');
    }
}