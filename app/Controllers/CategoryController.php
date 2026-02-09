<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class CategoryController extends ResourceController
{
    private $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new \App\Models\CategoryModel();
    }

    public function create()
    {
        $response = [];
        $newCategoryData = $this->request->getJSON();
        if ($this->categoryModel->insert($newCategoryData)) {
            $response = [
                'message' => [
                    'success' => 'Categoria criada com sucesso.'
                ]
            ];
        } else {
            $response = [
                'error_messages' => $this->categoryModel->errors()
            ];
        }
        return $this->respond($response);
    }

    public function update($id = null)
    {
        $response = [];
        $newCategoryData = $this->request->getJSON();
        
        $this->categoryModel->setValidationRule('nome', 'required|is_unique[category.nome,id,' . $id . ']|min_length[3]');
        
        if ($this->categoryModel->update($id, $newCategoryData)) {
            $response = [
                'message' => [
                    'success' => 'Categoria atualizada com sucesso.'
                ]
            ];
        } else {
            $response = [
                'error_messages' => $this->categoryModel->errors()
            ];
        }
        return $this->respond($response);
    }

    public function getCategory($id = null)
    {
        $response = [];
        $category = $this->categoryModel->find($id);
        if ($category) {
            $response = [
                'data' => $category
            ];
        } else {
            $response = [
                'message' => [
                    'error' => 'Categoria não encontrada.'
                ]
            ];
        }
        return $this->respond($response);
    }

    public function getAllCategories()
    {
        $categories = $this->categoryModel->findAll();
        $response = [
            'data' => $categories
        ];
        return $this->respond($response);
    }

    public function delete($id = null)
    {
        $response = [];
        if ($this->categoryModel->delete($id)) {
            $response = [
                'message' => [
                    'success' => 'Categoria deletada com sucesso.'
                ]
            ];
        } else {
            $response = [
                'message' => [
                    'error' => 'Categoria não encontrada.'
                ]
            ];
        }
        return $this->respond($response);
    }
}
