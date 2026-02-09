<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'category';
    protected $primaryKey = 'id';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $deletedField = 'deleted_at';
    protected $useSoftDeletes = true;
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id',
        'nome',
        'valor_diario',
        'valor_semanal',
        'valor_mensal',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $validationRules = [
        'nome' => 'required|is_unique[category.nome]|min_length[3]',
        'valor_diario' => 'required|decimal',
        'valor_semanal' => 'required|decimal',
        'valor_mensal' => 'required|decimal',
    ];

    public function updateCategory($id, $data)
    {
        $rules = $this->validationRules;
        $rules['nome'] = "required|min_length[3]|is_unique[category.nome,id,{$id}]";
        
        $this->setValidationRules($rules);
        
        return $this->update($id, $data);
    }
}
