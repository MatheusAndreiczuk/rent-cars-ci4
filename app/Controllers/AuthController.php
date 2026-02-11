<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;

class AuthController extends ResourceController
{
    private $userModel;
    public function __construct()
    {
        $this->userModel = new \App\Models\UserModel();
    }
    public function login()
    {
        $email = $this->request->getVar('email');
        $senha = $this->request->getVar('senha');

        $user = $this->userModel->where('email', $email)->first();

        if (!$user || !password_verify($senha, $user['senha'])) {
            return $this->failUnauthorized('Email ou senha inválidos.');
        }

        $key = getenv('JWT_SECRET');
        $payload = [
            'iat'  => time(),
            'exp'  => time() + 3600,
            'uid'  => $user['id'],
            'role' => $user['role'],
            'nome' => $user['nome']
        ];

        $token = JWT::encode($payload, $key, 'HS256');

        return $this->respond([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'nome' => $user['nome'],
                'role' => $user['role']
            ]
        ]);
    }
}
