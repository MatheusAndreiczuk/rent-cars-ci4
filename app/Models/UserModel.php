<?php 

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model {
    protected $useTimestamps = true;
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $useSoftDeletes = true;

    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';
    protected $allowedFields = [
        'nome',
        'cpf',
        'email',
        'telefone',
        'cnh_numero',
        'cnh_validade',
        'cnh_categoria',
        'cep',
        'numero',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    protected $validationRules = [
        'nome' => 'required|min_length[3]',
        'cpf' => 'required|is_unique[users.cpf]|exact_length[11]',
        'email' => 'required|valid_email|is_unique[users.email]',
        'telefone' => 'required|min_length[10]|max_length[15]',
        'cnh_numero' => 'required|is_unique[users.cnh_numero]',
        'cnh_validade' => 'required',
        'cnh_categoria' => 'required',
        'cep' => 'required|exact_length[8]',
        'numero' => 'required'
    ];

    public function updateUser($id, $data)
    {
        $rules = $this->validationRules;
        $rules['cpf']        = "required|exact_length[11]|is_unique[users.cpf,id,{$id}]";
        $rules['email']      = "required|valid_email|is_unique[users.email,id,{$id}]";
        $rules['cnh_numero'] = "required|is_unique[users.cnh_numero,id,{$id}]";

        $this->setValidationRules($rules);

        return $this->update($id, $data);
    }
}