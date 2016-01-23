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
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	/*
	this is the vpn table name
	*/
	$vpnTableName = 'arc_ald_jk7vd8';
	ob_clean();
	$db = getMainDB();
	$db1 = getDB();
	$vpns = new DB\SQL\Mapper($db,$vpnTableName);
	$vpn = $vpns->find([],array(
		'limit' => 100
	));
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
	}
	echo json_encode($response);
});
$f3->route('GET /publicData',function($f3){
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	/*
	this is the public ip table name
	*/
	$publicTableName = 'arc_ald_6idppj';
	ob_clean();
	$db = getMainDB();
	$db1 = getDB();
	$publics = new DB\SQL\Mapper($db,$publicTableName);
	$public = $publics->find([],array(
		'limit' => 100
	));
	$response = [
		"status" => 200,
		"message" => "",
		"data" => [],
		"noresult" => []
	];
	for($i = 0 ; $i < count($public) ; $i++){
		$query = "SELECT * FROM `ip2location` WHERE " . $public[$i]->source_address . " <= ip_to and " . $public[$i]->source_address . " >= ip_from";
		$result = $db1->exec($query);
		if(count($result) > 0){
			$result[0]['i_paddress'] = long2ip($public[$i]->source_address);
			$response['data'][] = arrayMerge($result[0],$public[$i]->cast());
		}else{
			$response['noresult'][] = [$public[$i]->source_address];            
		}
	}
	echo json_encode($response);
});
$f3->route('GET /blackListedData',function($f3){
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	/*
	this is the black listed ip table name
	*/
	$blackListedTableName = 'arc_ald_n783qv';
	ob_clean();
	$db = getMainDB();
	$db1 = getDB();
	$blacks = new DB\SQL\Mapper($db,$blackListedTableName);
	$black = $blacks->find([],array(
		'limit' => 100
	));
	$response = [
		"status" => 200,
		"message" => "",
		"data" => [],
		"noresult" => []
	];
	for($i = 0 ; $i < count($black) ; $i++){
		$query = "SELECT * FROM `ip2location` WHERE " . $black[$i]->malicious_i_p . " <= ip_to and " . $black[$i]->malicious_i_p . " >= ip_from";
		$result = $db1->exec($query);
		if(count($result) > 0){
			$result[0]['i_paddress'] = long2ip($black[$i]->malicious_i_p);
			$response['data'][] = arrayMerge($result[0],$black[$i]->cast());
		}else{
			$response['noresult'][] = [$black[$i]->malicious_i_p];            
		}
	}
	echo json_encode($response);
});
$f3->route('GET /allData',function($f3){
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 1800);
	ini_set('default_socket_timeout', 1800);
	/*
	this is the black listed ip table name
	*/
	$blackListedTableName = 'arc_ald_n783qv';
	ob_clean();
	$db = getMainDB();
	$db1 = getDB();
	$response = [
		"status" => 200,
		"message" => "",
		"publicData" => [],
		"blackData" => [],
		"vpnData" => []
	];
	$blacks = new DB\SQL\Mapper($db,$blackListedTableName);
	$black = $blacks->find([],array(
		'limit' => 200
	));
	for($i = 0 ; $i < count($black) ; $i++){
		$query = "SELECT * FROM `ip2location` WHERE " . $black[$i]->malicious_i_p . " <= ip_to and " . $black[$i]->malicious_i_p . " >= ip_from";
		$result = $db1->exec($query);
		if(count($result) > 0){
			$result[0]['i_paddress'] = long2ip($black[$i]->malicious_i_p);
			$response['blackData'][] = arrayMerge($result[0],$black[$i]->cast());
		}
	}
	/*
	this is the public ip table name
	*/
	$publicTableName = 'arc_ald_6idppj';
	$publics = new DB\SQL\Mapper($db,$publicTableName);
	$public = $publics->find([],array(
		'limit' => 100
	));
	for($i = 0 ; $i < count($public) ; $i++){
		$query = "SELECT * FROM `ip2location` WHERE " . $public[$i]->source_address . " <= ip_to and " . $public[$i]->source_address . " >= ip_from";
		$result = $db1->exec($query);
		if(count($result) > 0){
			$result[0]['i_paddress'] = long2ip($public[$i]->source_address);
			$response['publicData'][] = arrayMerge($result[0],$public[$i]->cast());
		}
	}

	/*
	this is the vpn table name
	*/
	$vpnTableName = 'arc_ald_jk7vd8';
	$vpns = new DB\SQL\Mapper($db,$vpnTableName);
	$vpn = $vpns->find([],array(
		'limit' => 100
	));
	for($i = 0 ; $i < count($vpn) ; $i++){
		$query = "SELECT * FROM `ip2location` WHERE " . sprintf('%u', ip2long($vpn[$i]->i_paddress)) . " <= ip_to and " . sprintf('%u', ip2long($vpn[$i]->i_paddress)) . " >= ip_from";
		$result = $db1->exec($query);
		if(count($result) > 0){
			$response['vpnData'][] = arrayMerge($result[0],$vpn[$i]->cast());
		}
	}
	echo json_encode($response);
});


$f3->route('GET /ip',function($f3){
	var_dump(long2ip($_GET['ip']));
	$db = getMainDB();
	var_dump($db->exec("select INET_NTOA(malicious_i_p) from arc_ald_n783qv limit 10"));
});

//var_dump(exec('c:\wamp\bin\mysql\mysql5.6.17\bin\mysqldump --user=root --password= --host=localhost vatsav > ./11111111111.sql') );

$f3->run();

//public ippen avatledu
//blacklisted ip open avataledu
//different colors for markers
//table lo 3 buttons
//google visualization view total load cheyyali