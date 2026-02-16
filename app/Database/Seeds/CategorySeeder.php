<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'nome' => 'Econômico',
                'valor_diario' => 150.00,
                'valor_semanal' => 900.00,
                'valor_mensal' => 3200.00,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'nome' => 'Intermediário',
                'valor_diario' => 250.00,
                'valor_semanal' => 1500.00,
                'valor_mensal' => 5000.00,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'nome' => 'Premium',
                'valor_diario' => 450.00,
                'valor_semanal' => 2700.00,
                'valor_mensal' => 10000.00,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'nome' => 'SUV',
                'valor_diario' => 300.00,
                'valor_semanal' => 1800.00,
                'valor_mensal' => 6500.00,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'nome' => 'Luxo',
                'valor_diario' => 800.00,
                'valor_semanal' => 4500.00,
                'valor_mensal' => 16000.00,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];

        $this->db->table('category')->insertBatch($data);
    }
}
