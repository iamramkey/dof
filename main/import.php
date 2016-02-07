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
		$single = new XMLWriter();
		$single->openMemory();
		$single->setIndent(true);
		$single->startDocument();
		$single->startElement("DocumentElement");
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
				addPublicElement($single,$finalResult);
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
		if(file_put_contents('XMLFiles/PublicIP.xml',$single->outputMemory()) !== false){
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
		//$insertRes = $db1->exec($insertArr);
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
	


function addPublicElement($single,$data){
	$single->startElement("WorldMap");
	$single->writeElement("ipAddess", $data['i_paddress']);
	$single->writeElement("ipAddessTarget", long2ip($data['destination_address']));
	$single->writeElement("creationTime", $data['creation_time']);
	$single->writeElement("attackCount", $data['count']);
	$single->writeElement("latitude", $data['latitude']);
	$single->writeElement("longitude", $data['longitude']);
	$single->writeElement("city", $data['city_name']);
	$single->writeElement("country", $data['country_name']);
	$single->writeElement("listStatus", "");
	$single->writeElement("destinationport", $data['port']);
	$single->writeElement("ImagePath", "");
	$single->endElement();
}


function generatePublicXML () {
	$single = new XMLWriter();
	$single->openMemory();
	$single->setIndent(true);
	$single->startDocument();
	$single->startElement("DocumentElement");
	$bulk = new XMLWriter();
	$bulk->openMemory();
	$bulk->setIndent(true);
	$bulk->startDocument();
	$bulk->startElement("DocumentElement");
	$db = db();
	$data = $db->exec('SELECT `si_no`, `created_date`, `case_no`, `title`, `locations`, `attack`, `priority`, `engineer`, `pending`, `statuses`, `closed`, `comments` FROM `hpsm_tickets`');
	for($i = 0; $i < count($data) ; $i++){
		if(strtotime($data[$i]['created_date']) >= mktime(0, 0, 0, date("m", strtotime("0 month")), 1, date("Y",strtotime("0 month")))){
			addElement($single,$data[$i]);
		}else if($data[$i]['statuses'] == 'Follow up'){
			addElement($single,$data[$i]);
		}
		addElement($bulk,$data[$i]);
	}
	$bulk->endElement();
	$single->endElement();
	if(file_put_contents('XMLFiles/HPSM_Tickets_Bulk.xml',$bulk->outputMemory()) !== false){
		if(file_put_contents('XMLFiles/HPSMTicketsMonthNew.xml',$single->outputMemory()) !== false){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
};

	//$f3->run();

	
?>