<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class CategoryController extends ResourceController
{
    protected $modelName = 'App\Models\CategoryModel';
    protected $format    = 'json';

    public function index()
    {
        return $this->respond($this->model->findAll());
    }

    public function show($id = null)
    {
        $category = $this->model->find($id);

        if (!$category) {
            return $this->failNotFound('Categoria não encontrada.');
        }

        return $this->respond($category);
    }

    public function create()
    {
        $data = $this->request->getJSON();

        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'message' => 'Categoria criada com sucesso.'
            ]);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    public function update($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('Categoria não encontrada.');
        }

        $data = $this->request->getJSON();

        if ($this->model->updateCategory($id, $data)) {
            return $this->respond(['message' => 'Categoria atualizada com sucesso.']);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    public function delete($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('Categoria não encontrada.');
        }

        if ($this->model->delete($id)) {
            return $this->respondDeleted(['message' => 'Categoria deletada com sucesso.']);
        }

        return $this->failServerError('Erro ao deletar categoria.');
    }
}