<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class Vehicles extends Migration
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
            'marca' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'modelo' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'ano_fabricacao' => [
                'type' => 'YEAR',
            ],
            'ano_modelo' => [
                'type' => 'YEAR',
            ],
            'placa' => [
                'type' => 'VARCHAR',
                'constraint' => 7,
                'unique' => true,
            ],
            'cor' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'km_atual' => [
                'type' => 'INT',
                'unsigned' => true,
            ],
            'id_categoria' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'combustivel' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
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
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('id_categoria', 'category', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('vehicles');
    }

    public function down()
    {
        $this->forge->dropTable('vehicles');
    }
}
