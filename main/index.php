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



/*
	this is the vpn table name
*/
$vpnTableName = 'arc_ald_jk7vd8';
/*
	this is the public ip table name
*/
$publicTableName = 'arc_ald_6idppj';
/*
	this is the black listed ip table name
*/
$blackListedTableName = 'arc_ald_n783qv';

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
	global $vpnTableName,$publicTableName,$blackListedTableName;
	$time_start = microtime(true);
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	ob_clean();
	$db = getMainDB1();
	$result = $db->exec("select * from $vpnTableName,soc_ipct.ip2location where inet_aton(i_paddress) <= ip_to and inet_aton(i_paddress) >= ip_from limit 100");
	$response = [
		"status" => 200,
		"message" => "",
		"data" => [],
		"noresult" => []
	];
	if(!empty($result)){
		$response['data'] = $result;
	}
	echo json_encode($response);
});

$f3->route('GET /publicData',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName;
	
	$time_start = microtime(true);
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	ob_clean();
	$db = getMainDB1();
	$response = [
		"status" => 200,
		"message" => "",
		"data" => [],
		"noresult" => []
	];
	$result = $db->exec("select *,INET_NTOA(source_address) as i_paddress from $publicTableName,soc_ipct.ip2location where source_address <= ip_to and source_address >= ip_from limit 100");
	if(!empty($result)){
		$response['data'] = $result;
	}
	echo json_encode($response);
});

$f3->route('GET /blackListedData',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName;
	$time_start = microtime(true);
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	ob_clean();
	$db = getMainDB1();
	$response = [
		"status" => 200,
		"message" => "",
		"data" => [],
		"noresult" => []
	];
	$result = $db->exec("select *,INET_NTOA(malicious_i_p) as i_paddress from $blackListedTableName,soc_ipct.ip2location where malicious_i_p <= ip_to and malicious_i_p >= ip_from limit 100");
	if(!empty($result)){
		$response['data'] = $result;
	}
	echo json_encode($response);
});
$f3->route('GET /allData',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName;
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 1800);
	ini_set('default_socket_timeout', 1800);
	ob_clean();
	$db = getMainDB1();
	$response = [
		"status" => 200,
		"message" => "",
		"publicData" => [],
		"blackData" => [],
		"vpnData" => []
	];
	$result = $db->exec("select * from $vpnTableName,soc_ipct.ip2location where inet_aton(i_paddress) <= ip_to and inet_aton(i_paddress) >= ip_from limit 100");
	if(!empty($result)){
		$response['vpnData'] = $result;
	}
	$result1 = $db->exec("select *,source_address as i_paddress from $publicTableName,soc_ipct.ip2location where source_address <= ip_to and source_address >= ip_from limit 100");
	if(!empty($result1)){
		$response['publicData'] = $result1;
	}
	$result2 = $db->exec("select *,malicious_i_p as i_paddress from $blackListedTableName,soc_ipct.ip2location where malicious_i_p <= ip_to and malicious_i_p >= ip_from limit 100");
	if(!empty($result2)){
		$response['blackData'] = $result2;
	}
	echo json_encode($response);
});
$f3->route('GET /time',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName;
	$time_start = microtime(true);
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 1800);
	ini_set('default_socket_timeout', 1800);
	ob_clean();
	$db = getMainDB1();
	$response = [
		"status" => 200,
		"message" => "",
		"publicData" => [],
		"blackData" => [],
		"vpnData" => []
	];

	$result = $db->exec("select * from $vpnTableName,soc_ipct.ip2location where inet_aton(i_paddress) <= ip_to and inet_aton(i_paddress) >= ip_from limit 100");
	if(!empty($result)){
		$response['vpnData'] = $result;
	}
	$result1 = $db->exec("select *,source_address as i_paddress from $publicTableName,soc_ipct.ip2location where source_address <= ip_to and source_address >= ip_from limit 100");
	if(!empty($result1)){
		$response['publicData'] = $result1;
	}
	$result2 = $db->exec("select *,malicious_i_p as i_paddress from $blackListedTableName,soc_ipct.ip2location where malicious_i_p <= ip_to and malicious_i_p >= ip_from limit 100");
	if(!empty($result2)){
		$response['blackData'] = $result2;
	}
	//echo json_encode($response);

	$time_end = microtime(true);

	//dividing with 60 will give the execution time in minutes other wise seconds
	$execution_time = ($time_end - $time_start);
	echo '<b>Total Execution Time:</b> '.$execution_time.' Seconds';
});


$f3->route('GET /ip',function($f3){
	var_dump(long2ip($_GET['ip']));
	$db = getMainDB1();
	var_dump($db->exec("select INET_NTOA(malicious_i_p) from arc_ald_n783qv limit 10"));
});

//var_dump(exec('c:\wamp\bin\mysql\mysql5.6.17\bin\mysqldump --user=root --password= --host=localhost vatsav > ./11111111111.sql') );

$f3->run();

//public ippen avatledu
//blacklisted ip open avataledu
//different colors for markers
//table lo 3 buttons
//google visualization view total load cheyyali