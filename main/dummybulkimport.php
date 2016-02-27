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
$vpnTableName = 'vpn';
/*
	this is the vulnerability ip table name
*/
$vulTableName = 'vulnerabilty';

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
		$database = 'soc_dashboarddb';
		$username = 'root';
		$password = '';
	}else{
		/*
			main database server details
		*/
		$host = '172.25.20.40';
		$port = '3306';
		$database = 'soc_dashboarddb';
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


	$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_bulk_error.log');
	$elog->write(" ********* An error occurred **************");
	$elog->write($f3->get('ERROR.code'));
	$elog->write($f3->get('ERROR.status'));
	$elog->write($f3->get('ERROR.text'));
	$elog->write($f3->get('ERROR.trace'));
}
		);

$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_vpn_bulk_info.log');
$vpnFile = 'XMLFiles/VPN_Bulk.xml';
$elog->write("reading $vpnTableName data in outerDb");
$result = $db->exec("select * from $vpnTableName");
$elog->write("$vpnTableName is having " . count($result) . " rows");
if(count($result) > 0){
	$single = new XMLWriter();
	$single->openMemory();
	$single->setIndent(true);
	$single->startDocument();
	$single->startElement("DocumentElement");
	foreach($result as $x) {
		$finalResult = $x;
		addVpnElement($single,$finalResult);
	}
	$single->endElement();
	if(file_put_contents($vpnFile,$single->outputMemory()) !== false){
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



//blacklisted xml file exporting

$vulFile = 'XMLFiles/Vulnerabilty_Bulk.xml';
$elog = new Log( 'logs/' . date('Y-m-d_H-i-s') . '_vulnerability_bulk_info.log');
$elog->write("reading $vulTableName data in outerDb");
$result = $db->exec("select * from $vulTableName");
$elog->write("$vulTableName is having " . count($result) . " rows");
if(count($result) > 0){
	$single = new XMLWriter();
	$single->openMemory();
	$single->setIndent(true);
	$single->startDocument();
	$single->startElement("DocumentElement");
	foreach($result as $x) {
		$finalResult = $x;
		addVulElement($single,$finalResult);
	}
	$single->endElement();
	if(file_put_contents($vulFile,$single->outputMemory()) !== false){
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
	$single->writeElement("ipAddess", $data['ipAddess']);
	$single->writeElement("creationTime", $data['creationTime']);
	$single->writeElement("attackCount", $data['attackCount']);
	$single->writeElement("latitude", $data['latitude']);
	$single->writeElement("longitude", $data['longitude']);
	$single->writeElement("city", $data['city']);
	$single->writeElement("country", $data['country']);
	$single->writeElement("listStatus", $data['listStatus']);
	$single->writeElement("ImagePath", $data['ImagePath']);
	$single->endElement();
}


function addVulElement($single,$data){
	$single->startElement("Vulnerabilty");
	$single->writeElement("TIMESTAMP", $data['TIMESTAMP']);
	$single->writeElement("CATEGORY", $data['CATEGORY']);
	$single->writeElement("VUL_NAME", $data['VUL_NAME']);
	$single->writeElement("ATTACKERADDRESS", $data['ATTACKERADDRESS']);
	$single->writeElement("IPADDRESS", $data['IPADDRESS']);
	$single->writeElement("ACTION", $data['ACTION']);
	$single->writeElement("DEVICEHOSTNAME", $data['DEVICEHOSTNAME']);
	$single->writeElement("LOCATION", $data['LOCATION']);
	$single->writeElement("SUMAGG", $data['SUMAGG']);
	$single->endElement();
}

//$f3->run();


?>