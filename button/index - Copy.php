<?php
session_start();
// Kickstart the framework
$f3 = require('lib/base.php');

$f3->set('DEBUG', 1);
if ((float)PCRE_VERSION < 7.9)
    trigger_error('PCRE version is out of date');

// Load configuration
$f3->config('config.ini');

function clean($f3, $value){
    return $f3->clean($f3->get($value));
}

$f3->route('GET /',function($f3){
    if(isset($_SESSION['user'])){
        echo View::instance()->render('overview.html');
    }else{
        echo View::instance()->render('login.html');   
    }
});

$f3->route('POST /@login',function($f3){
    var_dump($f3->get('PARAMS.login'));
   /* $username = clean($f3,'POST.username');
    $password = clean($f3,'POST.password');
    $response = [];
    if(empty($username) || empty($password)){
        $response['error'] = 'Empty user credentials';
        $response['status'] = 412;
        echo json_encode($response);
        return;
    }
    if($username == 'admin' && $password == 'admin'){
        $response['success'] = 'Successfully logged in';
        $response['status'] = 200;
        $_SESSION['user'] = 'admin';
        echo json_encode($response);
        return;
    }else{
        $response['error'] = 'Invalid Credentials';
        $response['status'] = 401;
        echo json_encode($response);
        return;
    }*/
});

$f3->route('POST /logout',function($f3){
    $response['success'] = 'Successfully logged out';
    $response['status'] = 200;
    unset($_SESSION['user']);
    echo json_encode($response);
    return;
});

$f3->route('GET /@route',function($f3){
    $route = $f3->get('PARAMS.route');
    $view = '';
    switch($route){
        case 'overview':
        case 'incidentoverview':
        case 'datacenter':
        case 'security': 
        case 'securityawareness':
        case 'worldmap':
        case 'rss':
            $view = $route . '.html';
        break;
        default:
            //$f3->reroute('/');
            var_dump($route);
            break;
    }
    echo View::instance()->render($view);
});

$f3->run();