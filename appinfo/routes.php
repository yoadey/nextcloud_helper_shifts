<?php
/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\Helpershifts\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
    'routes' => [
	   ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
	   ['name' => 'page#do_echo', 'url' => '/echo', 'verb' => 'POST'],

       ['name' => 'shift#index', 'url' => '/shift', 'verb' => 'GET'],
       ['name' => 'shift#show', 'url' => '/shift/{id}', 'verb' => 'GET'],
       ['name' => 'shift#create', 'url' => '/shift', 'verb' => 'POST'],
       ['name' => 'shift#update', 'url' => '/shift/{id}', 'verb' => 'PUT'],
       ['name' => 'shift#destroy', 'url' => '/shift/{id}', 'verb' => 'DELETE'],
    ]
];
