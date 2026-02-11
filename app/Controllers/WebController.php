<?php

namespace App\Controllers;

class WebController extends BaseController
{
    public function login()
    {
        return view('login');
    }
    public function cadastro()
    {
        return view('cadastro');
    }
}