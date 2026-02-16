<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class Users extends Migration
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
            'nome' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
            ],
            'cpf' => [
                'type' => 'VARCHAR',
                'constraint' => 11,
                'unique' => true,
            ],
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'unique' => true,
            ],
            'senha' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
            ],
            'role' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'telefone' => [
                'type' => 'VARCHAR',
                'constraint' => 15,
            ],
            'cnh_numero' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
                'unique' => true,
            ],
            'cnh_validade' => [
                'type' => 'DATE',
            ],
            'cnh_categoria' => [
                'type' => 'VARCHAR',
                'constraint' => 5,
            ],
            'cep' => [
                'type' => 'VARCHAR',
                'constraint' => 8,
            ],
            'numero' => [
                'type' => 'VARCHAR',
                'constraint' => 10,
                ],
                'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('users');
    }

    public function down()
    {
        $this->forge->dropTable(tableName: 'users');
    }
}
