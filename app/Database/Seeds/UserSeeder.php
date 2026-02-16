<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use Faker\Factory;

class UserSeeder extends Seeder
{
    public function run()
    {
        $faker = Factory::create('pt_BR');
        $data[] = [
            'nome'=> 'Admin master',
            'cpf' => '12345678900',
            'email' => 'admin@locadora.com',
            'senha' => password_hash('admin123', PASSWORD_DEFAULT),
            'role' => 'admin',
            'telefone' => '11999999999',
            'cnh_numero' => '12345678901',
            'cnh_validade' => date('Y-m-d', strtotime('+1 year')),
            'cnh_categoria' => 'A',
            'cep' => '12345678',
            'numero' => 1,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        for ($i = 0; $i < 20; $i++) {
            $data[] = [
                'nome' => $faker->name(),
                'cpf' => preg_replace('/\D/', '', $faker->cpf()),
                'email' => $faker->unique()->email(),
                'senha' => password_hash('senha123', PASSWORD_DEFAULT),
                'role' => 'client',
                'telefone' => preg_replace('/\D/', '', $faker->phoneNumber()),
                'cnh_numero' => $faker->numerify('############'),
                'cnh_validade' => $faker->dateTimeBetween('+1 year', '+10 years')->format('Y-m-d'),
                'cnh_categoria' => $faker->randomElement(['A', 'B', 'C', 'D', 'E']),
                'cep' => $faker->numerify('########'),
                'numero' => $faker->buildingNumber(),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ];
        }
        
        $this->db->table('users')->insertBatch($data);
    }
}
