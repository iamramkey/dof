<?php


// Kickstart the framework
$f3 = require('lib/base.php');


if(!is_dir('XMLFiles')){
	mkdir('XMLFiles');
}
$f3->set('DEBUG', 1);
if ((float)PCRE_VERSION < 7.9)
	trigger_error('PCRE version is out of date');
set_time_limit(0);
// Load configuration
$f3->config('config.ini');
$f3->set('DEBUG',0);


$development = false;

if($development){
	date_default_timezone_set ('Asia/Calcutta');
}else{
	date_default_timezone_set ('Asia/Muscat');
}

/*
	this is the vpn table name
*/
$vpnTableName = 'arc_ald_jk7vd8';
/*
	this is the vulnerability ip table name
*/
$vulTableName = 'arc_trend_e7tcnv';

/*
	this is the vpn table column
*/
$vpnColumn = 'i_paddress';
/*
	this is the vulnerability ip table name column name
*/
$vulColumn = 'attackerAddress';

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

$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_vpn_info.log');
$truncated = $db1->exec("truncate table $vpnTableName");
if(empty($truncated)){
	$elog->write("truncated $vpnTableName successfully");
}else{
	$elog->write("truncate failed on table name : $vpnTableName");
	$elog->write("Reason is ");
	$elog->write($db1->log());
	exit();
}
$elog->write("reading $vpnTableName data in outerDb");
$result = $db->exec("select * from $vpnTableName");
$elog->write("$vpnTableName is having " . count($result) . " rows");
$insertArr = [];
if(count($result) > 0){
	$single = new XMLWriter();
	$single->openMemory();
	$single->setIndent(true);
	$single->startDocument();
	$single->startElement("DocumentElement");
	foreach($result as $x) {
		$query = "select * from ip2location where '" . ip2long($x[$vpnColumn]) . "' <= ip_to and '" . ip2long($x[$vpnColumn]) . "' >= ip_from";
		$res = $db1->exec($query);
		if(!empty($res)){
			$finalResult = arrayMerge($x,$res[0]);
			$insertSQL = "INSERT INTO `" . $vpnTableName . "` SET ";
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
			addVpnElement($single,$finalResult);
		}
	}
	$insertRes = $db1->exec($insertArr);
	if($insertRes){
		$elog->write("Insert on  $vpnTableName is successfull");		
	}else{
		$elog->write("Insert on $vpnTableName is failed");
		$elog->write("Reason is ");
		$elog->write($db1->log());
	}
	$single->endElement();
	if(file_put_contents('XMLFiles/VPN.xml',$single->outputMemory()) !== false){
		$elog->write("Successfully written all records to single xml file");
	}else{
		$elog->write("there was an error writing data to single xml file");
	}
}	

$time_end = microtime(true);

//dividing with 60 will give the execution time in minutes other wise seconds
$execution_time = ($time_end - $time_start);
echo '<br><b>Total Execution Time:</b> '.$execution_time.' Seconds';

$elog->write('Total Execution Time: '.$execution_time.' Seconds');

//blacklisted table importing
$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_vulnerability_info.log');
$truncated = $db1->exec("truncate table $vulTableName");
if(empty($truncated)){
	$elog->write("truncated $vulTableName successfully");
}else{
	$elog->write("truncate failed on table name : $vulTableName");
	$elog->write("Reason is ");
	$elog->write($db1->log());
	exit();
}
$elog->write("reading $vulTableName data in outerDb");
$result = $db->exec("select * from $vulTableName");
$elog->write("$vulTableName is having " . count($result) . " rows");
$insertArr = [];
if(count($result) > 0){
	$single = new XMLWriter();
	$single->openMemory();
	$single->setIndent(true);
	$single->startDocument();
	$single->startElement("DocumentElement");
	foreach($result as $x) {
		$finalResult = $x;
		$insertSQL = "INSERT INTO `" . $vulTableName . "` SET ";
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
		addVulElement($single,$finalResult);
	}
	$insertRes = $db1->exec($insertArr);
	if($insertRes){
		$elog->write("Insert on  $vulTableName is successfull");		
	}else{
		$elog->write("Insert on $vulTableName is failed");
		$elog->write("Reason is ");
		$elog->write($db1->log());
	}
	$single->endElement();
	if(file_put_contents('XMLFiles/Vulnerabilty.xml',$single->outputMemory()) !== false){
		$elog->write("Successfully written all records to single xml file");
	}else{
		$elog->write("there was an error writing data to single xml file");
	}
}	
$f3->route('GET /NoNeXiStInGrOuTe',function($f3){

});

$time_end = microtime(true);

//dividing with 60 will give the execution time in minutes other wise seconds
$execution_time = ($time_end - $time_start);
$elog->write('Total Execution Time: '.$execution_time.' Seconds');
echo '<br><b>Total Execution Time:</b> '.$execution_time.' Seconds';



function addVpnElement($single,$data){
	$single->startElement("WorldMap");
	$single->writeElement("ipAddess", $data['i_paddress']);
	$single->writeElement("creationTime", $data['creation_time']);
	$single->writeElement("attackCount", $data['count']);
	$single->writeElement("latitude", $data['latitude']);
	$single->writeElement("longitude", $data['longitude']);
	$single->writeElement("city", $data['city_name']);
	$single->writeElement("country", $data['country_name']);
	$single->writeElement("listStatus", "");
	$single->writeElement("ImagePath", "");
	$single->endElement();
}


function addVulElement($single,$data){
	$single->startElement("Vulnerabilty");
	$single->writeElement("TIMESTAMP", $data['timeStamp']);
	$single->writeElement("CATEGORY", $data['Category_Type']);
	$single->writeElement("VUL_NAME", $data['Vul_Name']);
	$single->writeElement("ATTACKERADDRESS", $data['attackerAddress']);
	$single->writeElement("IPADDRESS", long2ip($data['attackerAddress']));
	$single->writeElement("ACTION", $data['deviceAction']);
	$single->writeElement("DEVICEHOSTNAME", $data['DevLocation']);
	$single->writeElement("LOCATION", $data['DevLocation']);
	$single->writeElement("SUMAGG", $data['SUM_aggregatedEventCount']);
	$single->endElement();
}


//$f3->run();


?>