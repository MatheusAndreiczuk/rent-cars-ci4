<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use Faker\Factory;

class VehicleSeeder extends Seeder
{
    public function run()
    {
        $faker = Factory::create('pt_BR');
        $marcas = ['Toyota', 'Honda', 'Renault', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Hyundai', 'Kia', 'BMW', 'Mercedes'];
        $modelos = [
            'Corolla',
            'Civic',
            'Fiesta',
            'Onix',
            'Gol',
            'Uno',
            'HB20',
            'Cerato',
            'X1',
            'C-Class',
            'Camry',
            'Accord',
            'Fusion',
            'Cruze',
            'Passat',
            'Siena',
            'Elantra',
            'Sorento',
            'X5',
            'E-Class',
            'Sandero',
            'City',
            'Ka',
            'Spin',
            'Polo',
            'Mobi',
            'Tucson',
            'Sportage',
            'X3',
            'GLA',
            'Duster',
            'Fit',
            'EcoSport',
            'Cobalt',
            'Virtus',
            'Argo',
            'Creta',
            'X4',
            'GLC'
        ];
        $cores = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Laranja', 'Marrom'];
        $combustiveis = ['flex', 'etanol', 'gasolina', 'diesel'];
        $status = ['disponivel', 'alugado', 'reservado', 'manutencao'];
        $data = [];

        $categories = $this->db->table('category')->get()->getResultArray();

        if (empty($categories)) {
            echo "Nenhuma categoria encontrada. Execute CategorySeeder primeiro!\n";
            return;
        }

        for ($i = 0; $i < 30; $i++) {
            $marca = $faker->randomElement($marcas);
            $modelo = $faker->randomElement($modelos);
            $ano = $faker->numberBetween(2015, 2026);

            // placa em 2 formatos para refletir a realidade brasileira
            $placa = $faker->randomElement([
                strtoupper($faker->bothify('???-####')),
                strtoupper($faker->bothify('???#?##'))
            ]);

            $data[] = [
                'marca' => $marca,
                'modelo' => $modelo,
                'ano_fabricacao' => $ano,
                'ano_modelo' => $ano + 1,
                'placa' => $placa,
                'cor' => $faker->randomElement($cores),
                'km_atual' => $faker->numberBetween(0, 400000),
                'id_categoria' => $faker->randomElement($categories)['id'],
                'combustivel' => $faker->randomElement($combustiveis),
                'status' => $faker->randomElement($status),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ];
        }

        $this->db->table('vehicles')->insertBatch($data);
    }
}
