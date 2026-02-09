<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('/users', 'UserController::create');
$routes->get('/users/(:num)', 'UserController::getUser/$1');
$routes->put('/users/(:num)', 'UserController::update/$1');
$routes->delete('/users/(:num)', 'UserController::delete/$1');
$routes->get('/users', 'UserController::getAllUsers');
