<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class Rentals extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'veiculo_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'valor_diario_praticado' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
                'null' => true,
            ],
            'data_retirada' => [
                'type' => 'DATETIME',
            ],
            'data_devolucao_prevista' => [
                'type' => 'DATETIME',
            ],
            'data_devolucao_real' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'valor_previsto' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
                'null' => true,
            ],
            'valor_total' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
                'null' => true,
            ],
            'km_inicial' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
            ],
            'km_final' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('veiculo_id', 'vehicles', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('rentals');
    }

    public function down()
    {
        $this->forge->dropTable('rentals');
    }
}
