<?php
session_start();


$development = false;

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

/*
	this is the public ip table column
*/
$publicColumn = 'source_address';
/*
	this is the black listed ip table name column name
*/
$blackColumn = 'malicious_i_p';
/*
	this is the vpn table name column name
*/
$vpnColumn = 'i_paddress';

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

$f3->route('GET /allData',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName,$publicColumn,$vpnColumn,$blackColumn;
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 1800);
	ini_set('default_socket_timeout', 1800);
	$db = outerDb();
	$db1 = ipDb();
	$response = [
		"status" => 200,
		"message" => "successfully retrieved data",
		"publicData" => [],
		"vpnData" => [],
		"blackData" => []
	];
	$result = $db->query("select *,INET_NTOA($publicColumn) as i_paddress from $publicTableName limit 100");
	if(!empty($result) && $result->num_rows > 0){
		while ($x = $result->fetch_assoc()) {
			$query = "select * from ip2location where " . $x[$publicColumn] . " <= ip_to and " . $x[$publicColumn] . " >= ip_from";
			$res = $db1->query($query);
			if(!empty($res) && $res->num_rows > 0){
				$row = $res->fetch_assoc();
				$response['publicData'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res->fetch_assoc()));
				$res->free();
			}
		}
		$result->free();
	}
	$q = "select * from $vpnTableName limit 100";
	$result = $db->query($q);
	if(!empty($result) && $result->num_rows > 0){
		while ($x = $result->fetch_assoc()) {
			$query = "select * from ip2location where inet_aton('" . $x[$vpnColumn] . "') <= ip_to and inet_aton('" . $x[$vpnColumn] . "') >= ip_from";
			$res = $db1->query($query);
			if(!empty($res) && $res->num_rows > 0){
				$row = $res->fetch_assoc();
				$response['vpnData'][] = arrayMerge($x,$row);
				$res->free();
			}
		}
		$result->free();
	}
	$q = "select *,INET_NTOA($blackColumn) as i_paddress from $blackListedTableName limit 100";
	$result = $db->query($q);
	if(!empty($result) && $result->num_rows > 0){
		while ($x = $result->fetch_assoc()) {
			$query = "select * from ip2location where " . $x[$blackColumn] . " <= ip_to and " . $x[$blackColumn] . " >= ip_from";
			$res = $db1->query($query);
			if(!empty($res) && $res->num_rows > 0){
				$row = $res->fetch_assoc();
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res->fetch_assoc()));
				$res->free();
			}
		}
		$result->free();
	}
	$db1->close();
	$db->close();
	echo json_encode($response);
});
function outerDb(){
	global $development;
	if($development){
		/*
			rama krishna's local system main database server details
		*/
		$host = 'localhost';
		$port = '3306';
		$database = 'arcsight';
		$username = 'root';
		$password = '';
	}else{
		/*
			main database server details
		*/
		$host = '172.25.20.40';
		$port = '3306';
		$database = 'arcsight';
		$username = 'dashboard';
		$password = 'dof1234';
	}
	$mysqli = new mysqli($host, $username, $password, $database);
	if ($mysqli->connect_errno) {
		die("mysqli connection error in db");
	}
	return $mysqli;
}
function ipDb(){
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
	$mysqli = new mysqli($host, $username, $password, $database);
	if ($mysqli->connect_errno) {
		die("mysqli connection error in db");
	}
	return $mysqli;
}
$f3->route('GET /publicData',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName,$publicColumn,$vpnColumn,$blackColumn;
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	ob_clean();
	$db = outerDb();
	$db1 = ipDb();
	$response = [
		"status" => 200,
		"message" => "successfully retrieved data",
		"data" => []
	];
	$result = $db->query("select *,INET_NTOA($publicColumn) as i_paddress from $publicTableName limit 100");
	if(!empty($result) && $result->num_rows > 0){
		while ($x = $result->fetch_assoc()) {
			$query = "select * from ip2location where " . $x[$publicColumn] . " <= ip_to and " . $x[$publicColumn] . " >= ip_from";
			$res = $db1->query($query);
			if(!empty($res) && $res->num_rows > 0){
				$row = $res->fetch_assoc();
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res->fetch_assoc()));
				$res->free();
			}
		}
		$result->free();
	}
	$db1->close();
	$db->close();
	echo json_encode($response);
});
$f3->route('GET /vpnData',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName,$publicColumn,$vpnColumn,$blackColumn;
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	ob_clean();
	$db = outerDb();
	$db1 = ipDb();
	$response = [
		"status" => 200,
		"message" => "successfully retrieved data",
		"data" => []
	];
	$q = "select * from $vpnTableName limit 100";
	$result = $db->query($q);
	if(!empty($result) && $result->num_rows > 0){
		while ($x = $result->fetch_assoc()) {
			$query = "select * from ip2location where inet_aton('" . $x[$vpnColumn] . "') <= ip_to and inet_aton('" . $x[$vpnColumn] . "') >= ip_from";
			$res = $db1->query($query);
			if(!empty($res) && $res->num_rows > 0){
				$row = $res->fetch_assoc();
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res->fetch_assoc()));
				$res->free();
			}
		}
		$result->free();
	}
	$db1->close();
	$db->close();
	echo json_encode($response);
});
$f3->route('GET /blackListedData',function($f3){
	global $vpnTableName,$publicTableName,$blackListedTableName,$publicColumn,$vpnColumn,$blackColumn;
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 300);
	ini_set('default_socket_timeout', 300);
	ob_clean();
	$db = outerDb();
	$db1 = ipDb();
	$response = [
		"status" => 200,
		"message" => "successfully retrieved data",
		"data" => []
	];
	$q = "select *,INET_NTOA($blackColumn) as i_paddress from $blackListedTableName limit 100";
	$result = $db->query($q);
	if(!empty($result) && $result->num_rows > 0){
		while ($x = $result->fetch_assoc()) {
			$query = "select * from ip2location where " . $x[$blackColumn] . " <= ip_to and " . $x[$blackColumn] . " >= ip_from";
			$res = $db1->query($query);
			if(!empty($res) && $res->num_rows > 0){
				$row = $res->fetch_assoc();
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res->fetch_assoc()));
				$res->free();
			}
		}
		$result->free();
	}
	$db1->close();
	$db->close();
	echo json_encode($response);
});

//var_dump(exec('c:\wamp\bin\mysql\mysql5.6.17\bin\mysqldump --user=root --password= --host=localhost vatsav > ./11111111111.sql') );

$f3->run();
