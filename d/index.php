<?php

// Kickstart the framework
$f3 = require('lib/base.php');

$f3->set('DEBUG', 1);
if ((float)PCRE_VERSION < 7.9)
    trigger_error('PCRE version is out of date');

// Load configuration
$f3->config('config.ini');

function db()
{
    return new DB\SQL(
        'mysql:host=localhost;port=3306;dbname=d',
        'root',
        ''
    );
}

if(!is_dir('XMLFiles')){
    mkdir('XMLFiles');
}

$f3->route('GET /', function ($f3) {
    $db = db();
    $data = $db->exec('SELECT `si_no`, `created_date`, `case_no`, `title`, `locations`, `attack`, `priority`, `engineer`, `pending`, `statuses`, `closed`, `comments` FROM `hpsm_tickets`');
    $f3->set('db', $data);
    $active = $db->exec("SELECT `si_no`, `created_date`, `case_no`, `title`, `locations`, `attack`, `priority`, `engineer`, `pending`, `statuses`, `closed`, `comments` FROM `hpsm_tickets` where statuses = 'Follow up'");
    $f3->set('active', $active);
    $statuses = $db->exec('select status_name from status');
    $f3->set('statuses', $statuses);
    $locations = $db->exec('select location_name from location');
    $f3->set('locations', $locations);
    echo View::instance()->render('data_filter.html');
});

function clean($f3, $value)
{
    return $f3->clean($f3->get($value));
}

$f3->route('POST /add', function ($f3) {
    $siNo = clean($f3, 'POST.siNo');
    $caseNo = clean($f3, 'POST.caseNo');
    $title = clean($f3, 'POST.title');
    $locations = clean($f3, 'POST.locations');
    $attack = clean($f3, 'POST.attack');
    $priority = clean($f3, 'POST.priority');
    $engineer = clean($f3, 'POST.engineer');
    $pending = clean($f3, 'POST.pending');
    $statuses = clean($f3, 'POST.statuses');
    $closed = clean($f3, 'POST.closed');
    $comments = clean($f3, 'POST.comments');
    $response = array();
    if (empty($siNo)) {
        $response['status'] = 412;
        $response['message'] = 'Invalid details provided';
        echo json_encode($response);
        return;
    }
    $db = db();
    $tickets = new DB\SQL\Mapper($db, 'hpsm_tickets');
    $ticket = $tickets->findone([
        'si_no = ?',
        $siNo
    ]);
    if (empty($ticket)) {
        $ticket = new DB\SQL\Mapper($db, 'hpsm_tickets');
        $ticket->si_no = $siNo;
        $ticket->case_no = $caseNo;
        $ticket->title = $title;
        $ticket->locations = $locations;
        $ticket->attack = $attack;
        $ticket->priority = $priority;
        $ticket->engineer = $engineer;
        $ticket->pending = $pending;
        $ticket->statuses = $statuses;
        $ticket->closed = $closed;
        $ticket->comments = $comments;
        $ticket->save();
        if(generateXML()){
	        $response['status'] = 200;
	        $response['message'] = 'Ticket created successfully';
	        $response['data'] = $ticket->cast();
	        unset($response['data']['id']);
	        echo json_encode($response);
        }else{
	        $response['status'] = 500;
	        $response['message'] = 'Internal application error';
	        echo json_encode($response);
	        return;
        }
    } else {
        $response['status'] = 201;
        $response['message'] = 'Id number already exists';
        echo json_encode($response);
        return;
    }
});

$f3->route('POST /edit', function ($f3) {
    $siNo = clean($f3, 'POST.siNo');
    $caseNo = clean($f3, 'POST.caseNo');
    $title = clean($f3, 'POST.title');
    $locations = clean($f3, 'POST.locations');
    $attack = clean($f3, 'POST.attack');
    $priority = clean($f3, 'POST.priority');
    $engineer = clean($f3, 'POST.engineer');
    $pending = clean($f3, 'POST.pending');
    $statuses = clean($f3, 'POST.statuses');
    $closed = clean($f3, 'POST.closed');
    $comments = clean($f3, 'POST.comments');
    $response = array();
    if (empty($siNo)) {
        $response['status'] = 412;
        $response['message'] = 'Invalid details provided';
        echo json_encode($response);
        return;
    }
    $db = db();
    $tickets = new DB\SQL\Mapper($db, 'hpsm_tickets');
    $ticket = $tickets->findone([
        'si_no = ?',
        $siNo
    ]);
    if (!empty($ticket)) {
        $ticket->case_no = $caseNo;
        $ticket->title = $title;
        $ticket->locations = $locations;
        $ticket->attack = $attack;
        $ticket->priority = $priority;
        $ticket->engineer = $engineer;
        $ticket->pending = $pending;
        $ticket->statuses = $statuses;
        $ticket->closed = $closed;
        $ticket->comments = $comments;
        $ticket->save();
	    if(generateXML()){
		    $response['status'] = 200;
		    $response['message'] = 'Ticket updated successfully';
		    $response['data'] = $ticket->cast();
		    unset($response['data']['id']);
		    unset($response['data']['inactive']);
		    echo json_encode($response);
	    }else{
		    $response['status'] = 500;
		    $response['message'] = 'Internal application error';
		    echo json_encode($response);
		    return;
	    }
    } else {
        $response['status'] = 201;
        $response['message'] = 'Id number doesnt exists';
        echo json_encode($response);
        return;
    }
});


$f3->route('POST /delete', function ($f3) {
    $siNo = clean($f3, 'POST.siNo');
    $response = array();
    if (empty($siNo)) {
        $response['status'] = 412;
        $response['message'] = 'Invalid details provided';
        echo json_encode($response);
        return;
    }
    $db = db();
    $tickets = new DB\SQL\Mapper($db, 'hpsm_tickets');
    $ticket = $tickets->findone([
        'si_no = ?',
        $siNo
    ]);
    if (!empty($ticket)) {
        $ticket->erase();
	    if(generateXML()){
		    $response['status'] = 200;
		    $response['message'] = 'Ticket deleted successfully';
		    echo json_encode($response);
	    }else{
		    $response['status'] = 500;
		    $response['message'] = 'Internal application error';
		    echo json_encode($response);
		    return;
	    }
    } else {
        $response['status'] = 201;
        $response['message'] = 'Id number doesnt exists';
        echo json_encode($response);
        return;
    }
});

	function addElement($single,$data){
		$single->startElement("HPSMTickets");
		$single->writeElement("Sl_No", $data['si_no']);
		$single->writeElement("Date", $data['created_date']);
		$single->writeElement("case_no", $data['case_no']);
		$single->writeElement("Case_title", $data['title']);
		$single->writeElement("location", $data['locations']);
		$single->writeElement("Types_of_Attack", $data['attack']);
		$single->writeElement("priority", $data['priority']);
		$single->writeElement("Engineer_Name", $data['engineer']);
		$single->writeElement("Pending_with", $data['pending']);
		$single->writeElement("Status", $data['statuses']);
		$single->writeElement("Comments", $data['comments']);
		$single->endElement();
	}


function generateXML () {
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
$f3->run();