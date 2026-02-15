<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AdminFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');
        $token = null;

        if (!empty($header)) {
            $token = explode(' ', $header)[1] ?? null;
        }

        if (is_null($token) || empty($token)) {
            $response = service('response');
            $response->setJSON(['error' => 'Acesso negado ou token ausente']);
            $response->setStatusCode(401);
            return $response;
        }

        try {
            $key = getenv('JWT_SECRET');
            $decoded = JWT::decode($token, new Key($key, 'HS256'));

            // verifica role
            if (!isset($decoded->role) || $decoded->role !== 'admin') {
                $response = service('response');
                $response->setJSON(['error' => 'Acesso restrito a administradores.']);
                $response->setStatusCode(403);
                return $response;
            }

            $request->user = $decoded;
        } catch (\Exception $e) {
            $response = service('response');
            $response->setJSON(['error' => 'Token inválido ou expirado']);
            $response->setStatusCode(401);
            return $response;
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {
        
    }
}
