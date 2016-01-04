<?php
session_start();
// Kickstart the framework
$f3 = require('lib/base.php');

$f3->set('DEBUG', 1);
if ((float)PCRE_VERSION < 7.9)
    trigger_error('PCRE version is out of date');
set_time_limit(0);
// Load configuration
$f3->config('config.ini');

function clean($f3, $value){
    return $f3->clean($f3->get($value));
}





/**
 * Merge two arrays - but if one is blank or not an array, return the other.
 * @param $a array First array, into which the second array will be merged
 * @param $b array Second array, with the data to be merged
 * @param $unique boolean If true, remove duplicate values before returning
 */
function arrayMerge($a, $b, $unique = false) {
	if (empty($b)) {
		return;  // No changes to be made to $a
	}
	if (empty($a)) {
		$a = $b;
		return;
	}
	$a = array_merge($a, $b);
	if ($unique) {
		$a = array_unique($a);
	}
	return $a;
}

$f3->route('GET /',function($f3){
    if(isset($_SESSION['user'])){
        $f3->reroute('/overview');
    }else{
        $f3->reroute('/login');  
    }
});

$f3->route('POST /login',function($f3){
    $username = clean($f3,'POST.username');
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
    }
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
        case 'overviews':
        case 'incidentoverview':
        case 'datacenter':
        case 'security': 
        case 'video': 
        case 'securityawareness':
        case 'worldmap':
        case 'custom':
        case 'calendar':
        case 'rss':
            if(isset($_SESSION['user'])){
                $view = $route . '.html';
            }else{
                $f3->reroute('/');
            }
            break;
        case 'login':
            unset($_SESSION['user']);
            $view = 'login.html';
            break;
        default:
            $f3->reroute('/');
            //var_dump($route);
            break;
    }
    echo View::instance()->render($view);
});

function getMainDB(){
	/*
	main database server details
	*/
	$host = '172.25.20.40';
	$port = '3306';
	$database = 'arcsight';
	$username = 'dashboard';
	$password = 'dof1234';
	return new DB\SQL(
		'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database,
		$username,
		$password
	);
}

function getMainDB1(){
	/*
	rama krishna's local system main database server details
	*/
	$host = 'localhost';
	$port = '3306';
	$database = 'arcsight';
	$username = 'root';
	$password = '';
	return new DB\SQL(
		'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database,
		$username,
		$password
	);
}

function getDB(){
	/*
	local system main database server details
	list of tables available in this db is 
	d ->hpsm_tickets
	d->location
	soc_ipct->ip2location
	*/
	$host = 'localhost';
	$port = '3306';
	$database = 'soc_ipct';
	$username = 'root';
	$password = '';
	return new DB\SQL(
		'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database,
		$username,
		$password
	);
}

$f3->route('GET /vpnData',function($f3){
	set_time_limit(0);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	/*
	this is the vpn table name
	*/
	$vpnTableName = 'ARC_ALD_JK7VD8';
	ob_clean();
	$db = getMainDB1();
	$db1 = getDB();
	/*$data = simplexml_load_file("XMLFiles/VPN_Bulk.xml");
    for($i = 0; $i < count( $data->WorldMap );$i++){
        $time = strtotime( DateTime::createFromFormat('d/m/Y', $data->WorldMap[$i]->creationTime)->format('Y-m-d') );
        if($time){
            $vpn->user_name = $data->WorldMap[$i]->UserName;
            $vpn->i_paddress = $data->WorldMap[$i]->ipAddess;
            $vpn->status = strcasecmp($data->WorldMap[$i]->listStatus,'success') ? 'succ' : 'fail';
            $vpn->creation_time = date('Y-m-d H:i:s.u',$time);
            $vpn->last_modified_time = date('Y-m-d H:i:s.u',$time);
            $vpn->count = $data->WorldMap[$i]->attackCount;
            $vpn->save();            
            ob_flush();  
        }        
    }*/
	$vpns = new DB\SQL\Mapper($db,$vpnTableName);
	$vpn = $vpns->find();
	$response = [
		"status" => 200,
		"message" => "",
		"data" => [],
		"noresult" => []
	];
	for($i = 0 ; $i < count($vpn) ; $i++){
		$query = "SELECT * FROM `ip2location` WHERE " . sprintf('%u', ip2long($vpn[$i]->i_paddress)) . " <= ip_to and " . sprintf('%u', ip2long($vpn[$i]->i_paddress)) . " >= ip_from";
		$result = $db1->exec($query);
		if(count($result) > 0){
			$response['data'][] = arrayMerge($result[0],$vpn[$i]->cast());
		}else{
			$response['noresult'][] = [$vpn[$i]->i_paddress,sprintf('%u', ip2long($vpn[$i]->i_paddress))];            
		}
		if(count($response['data']) > 10){
			$response['status'] = 200;
			break;
		}
	}
	echo json_encode($response);
});
$f3->run();