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
	$q = "select * from $vpnTableName";
	$result = $db->exec($q);
	if(count($result) > 0){
		foreach($result as $x) {
			$query = "select * from ip2location where inet_aton('" . $x[$vpnColumn] . "') <= ip_to and inet_aton('" . $x[$vpnColumn] . "') >= ip_from";
			$res = $db1->exec($query);
			if(count($res) > 0){
				$row = $res[0];
				$response['vpnData'][] = arrayMerge($x,$row);
			}
		}
	}
	
	$q = "select * from $publicTableName";
	$result = $db1->exec($q);
	if(count($result) > 0){
		/*foreach($result as $x) {
			$query = "select * from ip2location where " . $x[$publicColumn] . " <= ip_to and " . $x[$publicColumn] . " >= ip_from";
			$res = $db1->exec($query);
			if(count($res) > 0){
				$row = $res[0];
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res[0]));
			}
		}*/
		$response['publicData'] = $result;
	}
	
	$q = "select * from $blackListedTableName";
	$result = $db1->exec($q);
	if(count($result) > 0){
		/*foreach($result as $x) {
			$query = "select * from ip2location where " . $x[$blackColumn] . " <= ip_to and " . $x[$blackColumn] . " >= ip_from";
			$res = $db1->exec($query);
			if(count($res) > 0){
				$row = $res[0];
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res[0]));
			}
		}*/
		$response['blackData'] = $result;
	}
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
	return new DB\SQL(
		'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database,
		$username,
		$password
	);
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
	return new DB\SQL(
		'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database,
		$username,
		$password
	);
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
	$q = "select *,INET_NTOA(destination_address) as destination_address1 from $publicTableName";
	$result = $db1->exec($q);
	if(count($result) > 0){
		/*foreach($result as $x) {
			$query = "select * from ip2location where " . $x[$publicColumn] . " <= ip_to and " . $x[$publicColumn] . " >= ip_from";
			$res = $db1->exec($query);
			if(count($res) > 0){
				$row = $res[0];
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res[0]));
			}
		}*/
		$response['data'] = $result;
	}
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
	$result = $db->exec($q);
	if(count($result) > 0){
		foreach($result as $x) {
			$query = "select * from ip2location where inet_aton('" . $x[$vpnColumn] . "') <= ip_to and inet_aton('" . $x[$vpnColumn] . "') >= ip_from";
			$res = $db1->exec($query);
			if(count($res) > 0){
				$row = $res[0];
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res[0]));
			}
		}
	}
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
	$q = "select * from $blackListedTableName limit 1000";
	$result = $db1->exec($q);
	if(count($result) > 0){
		/*foreach($result as $x) {
			$query = "select * from ip2location where " . $x[$blackColumn] . " <= ip_to and " . $x[$blackColumn] . " >= ip_from";
			$res = $db1->exec($query);
			if(count($res) > 0){
				$row = $res[0];
				$response['data'][] = arrayMerge($x,$row);
				//array_push($response['data'],arrayMerge($x,$res[0]));
			}
		}*/
		$response['data'] = $result;
	}
	echo json_encode($response);
});

$f3->route('GET /import',function($f3){
	$time_start = microtime(true);
	echo "Execution started";
	global $vpnTableName,$publicTableName,$blackListedTableName,$publicColumn,$vpnColumn,$blackColumn;
	set_time_limit(0);
	ini_set("memory_limit",-1);
	ini_set('mysql.connect_timeout', 6000);
	ini_set('default_socket_timeout', 6000);
	$db = outerDb();
	$db1 = ipDb();
	
	$f3->set('ONERROR', function($f3) {
        // custom error handler code goes here
        // use this if you want to display errors in a
        // format consistent with your site's theme		
	
		$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_error.log');
		$elog->write(" ********* An error occurred **************");
		$elog->write($f3->get('ERROR.code'));
		$elog->write($f3->get('ERROR.status'));
		$elog->write($f3->get('ERROR.text'));
		$elog->write($f3->get('ERROR.trace'));
    });
	
	$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_public_info.log');
	$truncated = $db1->exec("truncate table $publicTableName");
	if(empty($truncated)){
		$elog->write("truncated $publicTableName successfully");
	}else{
		$elog->write("truncate failed on table name : $publicTableName");
		$elog->write("Reason is ");
		$elog->write($db1->log());
		exit();
	}
	$elog->write("reading $publicTableName data in outerDb");
	$result = $db->exec("select * from $publicTableName");
	$elog->write("$publicTableName is having " . count($result) . " rows");
	$insertArr = [];
	if(count($result) > 0){		
		foreach($result as $x) {
			$query = "select *,INET_NTOA('" . $x[$publicColumn] . "') as i_paddress from ip2location where '" . $x[$publicColumn] . "' <= ip_to and '" . $x[$publicColumn] . "' >= ip_from";
			$res = $db1->exec($query);
			if(!empty($res)){
				$finalResult = arrayMerge($x,$res[0]);
				$insertSQL = "INSERT INTO `" . $publicTableName . "` SET ";
				foreach ($finalResult as $field => $value) {
					if($field == 'id'){
						continue;						
					}
					$insertSQL .= " `" . $field . "` = '" . addslashes($value) . "', ";
				}
				$insertSQL = trim($insertSQL, ", ");
				$elog->write("query is");
				$elog->write("$insertSQL");
				$insertArr[] = $insertSQL;
			}
		}
		$insertRes = $db1->exec($insertArr);
		if($insertRes){
			$elog->write("Insert on  $publicTableName is successfull");		
		}else{
			$elog->write("Insert on $publicTableName is failed");
			$elog->write("Reason is ");
			$elog->write($db1->log());
		}
	}	
	
	$time_end = microtime(true);

	//dividing with 60 will give the execution time in minutes other wise seconds
	$execution_time = ($time_end - $time_start);
	echo '<br><b>Total Execution Time:</b> '.$execution_time.' Seconds';
	
	$elog->write('Total Execution Time: '.$execution_time.' Seconds');
	//blacklisted table importing
	$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_black_info.log');
	$truncated = $db1->exec("truncate table $blackListedTableName");
	if(empty($truncated)){
		$elog->write("truncated $blackListedTableName successfully");
	}else{
		$elog->write("truncate failed on table name : $blackListedTableName");
		$elog->write("Reason is ");
		$elog->write($db1->log());
		exit();
	}
	$elog->write("reading $blackListedTableName data in outerDb");
	$result = $db->exec("select * from $blackListedTableName");
	$elog->write("$blackListedTableName is having " . count($result) . " rows");
	$insertArr = [];
	if(count($result) > 0){
		foreach($result as $x) {
			$query = "select *,INET_NTOA('" . $x[$blackColumn] . "') as i_paddress from ip2location where '" . $x[$blackColumn] . "' <= ip_to and '" . $x[$blackColumn] . "' >= ip_from";
			$res = $db1->exec($query);
			if(!empty($res)){
				$finalResult = arrayMerge($x,$res[0]);
				$insertSQL = "INSERT INTO `" . $blackListedTableName . "` SET ";
				foreach ($finalResult as $field => $value) {
					if($field == 'id'){
						continue;						
					}
					$insertSQL .= " `" . $field . "` = '" . addslashes($value) . "', ";
				}
				$insertSQL = trim($insertSQL, ", ");
				$elog->write("query is");
				$elog->write("$insertSQL");
				$insertArr[] = $insertSQL;
			}
		}
		$insertRes = $db1->exec($insertArr);
		if($insertRes){
			$elog->write("Insert on  $blackListedTableName is successfull");		
		}else{
			$elog->write("Insert on $blackListedTableName is failed");
			$elog->write("Reason is ");
			$elog->write($db1->log());
		}
	}
	
	$time_end = microtime(true);

	//dividing with 60 will give the execution time in minutes other wise seconds
	$execution_time = ($time_end - $time_start);
	$elog->write('Total Execution Time: '.$execution_time.' Seconds');
	echo '<br><b>Total Execution Time:</b> '.$execution_time.' Seconds';
	echo "<br>Successfully imported 2 tables";
});

//var_dump(exec('c:\wamp\bin\mysql\mysql5.6.17\bin\mysqldump --user=root --password= --host=localhost vatsav > ./11111111111.sql') );

//select *,INET_NTOA(source_address) as i_paddress from arc_ald_6idppj,ip2location where source_address <= ip_to and source_address>= ip_from

$f3->run();
