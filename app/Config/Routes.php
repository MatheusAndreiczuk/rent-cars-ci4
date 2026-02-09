<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->resource('users', ['controller' => 'UserController']);

$routes->resource('categories', ['controller' => 'CategoryController']);

$routes->post('/vehicles', 'VehicleController::create');
$routes->get('/vehicles/(:num)', 'VehicleController::getVehicle/$1');
$routes->get('/vehicles', 'VehicleController::getAllVehicles');
$routes->put('/vehicles/(:num)', 'VehicleController::update/$1');
$routes->delete('/vehicles/(:num)', 'VehicleController::delete/$1');

