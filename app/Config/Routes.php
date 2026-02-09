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

$routes->post('/categories', 'CategoryController::create');
$routes->get('/categories/(:num)', 'CategoryController::getCategory/$1');
$routes->get('/categories', 'CategoryController::getAllCategories');
$routes->put('/categories/(:num)', 'CategoryController::update/$1');
$routes->delete('/categories/(:num)', 'CategoryController::delete/$1');

