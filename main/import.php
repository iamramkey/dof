<?php


// Kickstart the framework
$f3 = require('lib/base.php');

$f3->set('DEBUG', 1);
if ((float)PCRE_VERSION < 7.9)
    trigger_error('PCRE version is out of date');
set_time_limit(0);
// Load configuration
$f3->config('config.ini');
$f3->set('DEBUG',0);


$development = true;

if($development){
	date_default_timezone_set ('Asia/Calcutta');
}else{
	date_default_timezone_set ('Asia/Muscat');
}

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
	$time_start = microtime(true);
	echo "Execution started";
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
    }
	);
	
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
			$insertSQL = "INSERT INTO `" . $publicTableName . "` SET ";
			foreach ($x as $field => $value) {
				$insertSQL .= " `" . $field . "` = '" . $value . "', ";
			}
			$insertSQL = trim($insertSQL, ", ");
			$elog->write("query is");
			$elog->write("$insertSQL");
			$insertArr[] = $insertSQL;
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
			$insertSQL = "INSERT INTO `" . $blackListedTableName . "` SET ";
			foreach ($x as $field => $value) {
				$insertSQL .= " `" . $field . "` = '" . $value . "', ";
			}
			$insertSQL = trim($insertSQL, ", ");
			$elog->write("query is");
			$elog->write("$insertSQL");
			$insertArr[] = $insertSQL;
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
	
	$f3->route('GET /NoNeXiStInGrOuTe',function($f3){
	
	});
	
	$time_end = microtime(true);

	//dividing with 60 will give the execution time in minutes other wise seconds
	$execution_time = ($time_end - $time_start);
	$elog->write('Total Execution Time: '.$execution_time.' Seconds');
	echo '<br><b>Total Execution Time:</b> '.$execution_time.' Seconds';
	
	//$f3->run();

	
	/*
	#blacklistedtable
	
	CREATE TABLE arc_ald_n783qv (
	 ID int NOT NULL AUTO_INCREMENT primary key,
	 malicious_i_p bigint(20) DEFAULT NULL,
	 malicious_domain varchar(1000) COLLATE utf8_bin DEFAULT NULL,
	 message varchar(1000) COLLATE utf8_bin DEFAULT NULL,
	 creation_time datetime(3) NOT NULL,
	 last_modified_time datetime(3) NOT NULL,
	 count int(11) NOT NULL,
	 hash_code bigint(20) NOT NULL,
	 KEY ARC_ALD_N783QV_main (malicious_i_p),
	 KEY ARC_ALD_N783QV_hashIndex (hash_code)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
	
	#publictablecreation
	CREATE TABLE arc_ald_6idppj (
	  ID int NOT NULL AUTO_INCREMENT primary key,
	  source_address bigint(20) DEFAULT NULL,
	  destination_address bigint(20) DEFAULT NULL,
	  port int(11) DEFAULT NULL,
	  creation_time datetime(3) NOT NULL,
	  last_modified_time datetime(3) NOT NULL,
	  count int(11) NOT NULL,
	  hash_code bigint(20) NOT NULL,
	  KEY ARC_ALD_6IDPPJ_main (source_address,destination_address,port),
	  KEY ARC_ALD_6IDPPJ_hashIndex (hash_code)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin
	*/
?>