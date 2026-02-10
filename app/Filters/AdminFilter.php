<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AdminFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $user = $request->user ?? null;

        if (!$user || $user->role !== 'admin') {
            $response = service('response');
            $response->setJSON(['error' => 'Acesso restrito a administradores.']);
            $response->setStatusCode(403);
            return $response;
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {
        
    }
}
