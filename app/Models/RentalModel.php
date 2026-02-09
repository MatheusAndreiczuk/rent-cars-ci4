<?php

namespace App\Models;

use CodeIgniter\Model;

class RentalModel extends Model
{
    protected $table            = 'rentals';
    protected $primaryKey       = 'id';
    protected $useTimestamps    = true;

    protected $allowedFields = [
    'user_id', 
    'veiculo_id',
    'valor_diario_praticado',
    'data_retirada', 
    'data_devolucao_prevista', 
    'data_devolucao_real',
    'valor_previsto', 
    'valor_total',
    'km_inicial', 
    'km_final',
    'status' // reservado, ativo, finalizado, cancelado
];

    protected $validationRules = [
        'user_id'                 => 'required|is_natural_no_zero',
        'veiculo_id'              => 'required|is_natural_no_zero',
        'data_retirada'           => 'required',
        'data_devolucao_prevista' => 'required'
    ];
}
