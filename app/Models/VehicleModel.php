<?php 

namespace App\Models;

use CodeIgniter\Model;

class VehicleModel extends Model {
    protected $useTimestamps = true;
    protected $useSoftDeletes   = true;
    protected $table = 'vehicles';
    protected $primaryKey = 'id';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField     = 'deleted_at';
    protected $allowedFields = [
        'marca',
        'modelo',
        'ano_fabricacao',
        'ano_modelo',
        'placa',
        'cor',
        'km_atual',
        'id_categoria',
        'combustivel',
        'status',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    protected $validationRules = [
        'marca' => 'required|min_length[2]',
        'modelo' => 'required|min_length[2]',
        'ano_fabricacao' => 'required|exact_length[4]|is_natural_no_zero',
        'ano_modelo' => 'required|exact_length[4]|is_natural_no_zero',
        'km_atual' => 'required|is_natural',
        'placa' => 'required|is_unique[vehicles.placa]|exact_length[7]',
        'cor' => 'required|min_length[3]',
        'combustivel' => 'required|in_list[flex,etanol,gasolina,diesel]',
        'status' => 'required|in_list[disponivel,alugado,manutencao]',
        'id_categoria' => 'required|is_natural_no_zero'
    ];

    public function getVehicle($id = null)
    {
        $builder = $this->select('vehicles.*')
             ->select('category.nome as categoria_nome')
             ->select('category.valor_diario, category.valor_semanal, category.valor_mensal')
             ->join('category', 'category.id = vehicles.id_categoria');

        if ($id) {
            return $builder->find($id);
        }

        return $builder->findAll();
    }

    public function updateVehicle($id, $data)
    {
        $rules = $this->validationRules;
        $rules['placa'] = "required|exact_length[7]|is_unique[vehicles.placa,id,{$id}]";
        
        $this->setValidationRules($rules);
        
        return $this->update($id, $data);
    }
}