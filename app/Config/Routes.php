<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
//rotas públicas
$routes->get('/', 'Home::index');
$routes->post('login', 'AuthController::login');
$routes->post('cadastro', 'UserController::create');
$routes->get('login', 'WebController::login');
$routes->get('cadastro', 'WebController::cadastro');
$routes->get('home', 'WebController::home');    

// rotas autenticadas
$routes->group('', ['filter' => 'auth'], function($routes) {
    $routes->get('users/(:num)', 'UserController::show/$1');
    $routes->put('users/(:num)', 'UserController::update/$1');
    $routes->delete('users/(:num)', 'UserController::delete/$1');
    
    $routes->get('rentals/my', 'RentalController::myRentals');
    $routes->post('rentals', 'RentalController::create');
    $routes->put('rentals/(:num)/cancel', 'RentalController::cancel/$1');    // cancelamento
    
    $routes->get('vehicles', 'VehicleController::index');
    $routes->get('vehicles/(:num)', 'VehicleController::show/$1');
    
    $routes->get('categories', 'CategoryController::index');
    $routes->get('categories/(:num)', 'CategoryController::show/$1');
});

// rotas admin
$routes->group('', ['filter' => 'admin'], function($routes) {
    $routes->get('users', 'UserController::index');
    
    $routes->post('categories', 'CategoryController::create');
    $routes->put('categories/(:num)', 'CategoryController::update/$1');
    $routes->delete('categories/(:num)', 'CategoryController::delete/$1');
    
    $routes->post('vehicles', 'VehicleController::create');
    $routes->put('vehicles/(:num)', 'VehicleController::update/$1');
    $routes->delete('vehicles/(:num)', 'VehicleController::delete/$1');
    
    $routes->get('rentals', 'RentalController::index');
    $routes->get('rentals/(:num)', 'RentalController::show/$1');
    $routes->delete('rentals/(:num)', 'RentalController::delete/$1');
    $routes->put('rentals/(:num)/start', 'RentalController::start/$1');      // retirada
    $routes->put('rentals/(:num)/finish', 'RentalController::finish/$1');    // devolução
});
