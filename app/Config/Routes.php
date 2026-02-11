<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('login', 'AuthController::login');
$routes->post('cadastro', 'UserController::create');

$routes->get('login', 'WebController::login');
$routes->get('cadastro', 'WebController::cadastro');    

$routes->resource('users', ['controller' => 'UserController']);

$routes->resource('categories', ['controller' => 'CategoryController']);

$routes->resource('vehicles', ['controller' => 'VehicleController']);

// rentals 
$routes->get('rentals', 'RentalController::index');
$routes->post('rentals', 'RentalController::create');               
$routes->get('rentals/(:num)', 'RentalController::show/$1');
$routes->delete('rentals/(:num)', 'RentalController::delete/$1');
$routes->put('rentals/(:num)/start', 'RentalController::start/$1');      // retirada
$routes->put('rentals/(:num)/finish', 'RentalController::finish/$1');    // devolução
$routes->put('rentals/(:num)/cancel', 'RentalController::cancel/$1');    // cancelamento

