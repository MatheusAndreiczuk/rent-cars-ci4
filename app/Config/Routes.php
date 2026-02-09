<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->resource('users', ['controller' => 'UserController']);

$routes->resource('categories', ['controller' => 'CategoryController']);

$routes->resource('vehicles', ['controller' => 'VehicleController']);

