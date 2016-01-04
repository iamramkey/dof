
google.load("visualization", "1.1", {packages:["calendar"]});
google.setOnLoadCallback(drawChart);

var xmlPath = 'XMLFiles/',
    chartOptions,
    virusChart,
    virusData = {},
    malware = {},
    spyware = {},
    virusDataTable,
    virusMonthData = {
        0 : [],
        1 : [],
        2 : [],
        3 : [],
        4 : [],
        5 : [],
        6 : [],
        7 : [],
        8 : [],
        9 : [],
        10 : [],
        11 : [],
    },
    threatChart,
    threatData = {},
    threatDataTable,
    threatMonthData = {
        0 : [],
        1 : [],
        2 : [],
        3 : [],
        4 : [],
        5 : [],
        6 : [],
        7 : [],
        8 : [],
        9 : [],
        10 : [],
        11 : [],
    },
    vpnChart,
    vpnData = {},
    vpnDataTable,
    vpnMonthData = {
        0 : [],
        1 : [],
        2 : [],
        3 : [],
        4 : [],
        5 : [],
        6 : [],
        7 : [],
        8 : [],
        9 : [],
        10 : [],
        11 : [],
    },
    ticketChart,
    ticketData = {},
    ticketDataTable,
    ticketMonthData = {
        0 : [],
        1 : [],
        2 : [],
        3 : [],
        4 : [],
        5 : [],
        6 : [],
        7 : [],
        8 : [],
        9 : [],
        10 : [],
        11 : [],
    },
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function parser(data) {
    var rex = /(\<(\/)?[A-Za-z0-9]+\>)(\s)+/gi;
    data = data.replace(rex, "$1");
    return $.parseXML(data);
}
function hasResponses(datasource) {
    return datasource.length - 1;
}
function hideLoader(){
    if(virusChart instanceof Object &&
       threatChart instanceof Object &&
       vpnChart instanceof Object &&
       ticketChart instanceof Object){
        $('#preloader').addClass('inactive').fadeOut();
    }
}
function setHeight(){
    $('.modal-body').attr('style','').scrollLeft(0).scrollTop(0);
    var maxHeight = $('#myModal').height() - 150 - $('.modal-header').height() -  $('.modal-footer').height();
    if($('.modal-body').height() > maxHeight){
        $('.modal-body').height(maxHeight);
    }
}
Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

function virusReady(){
    $('#chart1 text:contains(Virus)').css('font-size','20px');
    for(var i = 0 ; i < months.length ; i++){
        virusMonthData[i].length > 0 ? $('#chart1 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        }).text(months[i] +'['+ virusMonthData[i].length + ']') : $('#chart1 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        });
    }/*
    var x = $('#chart1 rect').not('[fill=#ffffff]').not('[height=4]');
    var y = x.first();
    var z = $('<g>').append('<text>12</text>').insertAfter(y).attr('height','30').attr('width','40').attr('fill','#369');
    z.append(x.first())*/
    google.visualization.events.addListener(virusChart, 'select', virusHandler);
}

function virusButtons(){
    if(!this.disabled && !$(this).hasClass('btn-primary')){
        var hdata = this.getAttribute('id') == 'malware' ?  malware[new Date(virusChart.getSelection()[0].date).yyyymmdd()] : spyware[new Date(virusChart.getSelection()[0].date).yyyymmdd()];
        if(hdata){
            $('#tableBody').html('');
            for(var i = 0 ;each = hdata[i] ; i++){
                var tr = $('<tr>');
                $('#tableBody').append(tr);
                tr.append($('<td>').text(each['timestamp']))
                tr.append($('<td>').text(each['ipaddress']))
                tr.append($('<td>').text(each['location']))
                tr.append($('<td>').text(each['action']))
                tr.append($('<td>').text(each['timestamp']))
                tr.append($('<td>').text(each['hostname'] || each['devicehostname']));
            }
            $('#virusButtons .btn-primary').removeClass('btn-primary');
            $(this).removeClass('btn-default').addClass('btn-primary');
            //virusChart.setSelection(null);
            setHeight();
        }
    }
}

function virusHandler(e) {
    if(virusChart.getSelection().length == 1){        
        var hData = malware[new Date(virusChart.getSelection()[0].date).yyyymmdd()] != null ? malware[new Date(virusChart.getSelection()[0].date).yyyymmdd()] : spyware[new Date(virusChart.getSelection()[0].date).yyyymmdd()];
        if(hData){
            !malware[new Date(virusChart.getSelection()[0].date).yyyymmdd()] ? $('#malware').attr('class','btn btn-default').prop('disabled',true) : $('#malware').attr('class','btn btn-default').prop('disabled',false);
            !spyware[new Date(virusChart.getSelection()[0].date).yyyymmdd()] ? $('#spyware').attr('class','btn btn-default').prop('disabled',true) : $('#spyware').attr('class','btn btn-default').prop('disabled',false);
            $('#virusButtons').show();
            $('.modal-title').text('Virus Attacks');
            $('#table').fadeIn();
            $('#tableHead').html('')
                .append($('<th>').text('Timestamp'))
                .append($('<th>').text('IPAddress'))
                .append($('<th>').text('LOCATION'))
                .append($('<th>').text('ACTION'))
                .append($('<th>').text('TIMESTAMP'))
                .append($('<th>').text('Hostname'));
            $('#tableBody').html('');
            for(var i = 0 ;each = hData[i] ; i++){
                var tr = $('<tr>');
                $('#tableBody').append(tr);
                tr.append($('<td>').text(each['timestamp']))
                tr.append($('<td>').text(each['ipaddress']))
                tr.append($('<td>').text(each['location']))
                tr.append($('<td>').text(each['action']))
                tr.append($('<td>').text(each['timestamp']))
                tr.append($('<td>').text(each['hostname'] || each['devicehostname']));
            }
            //virusChart.setSelection(null);
            setHeight();
            malware[new Date(virusChart.getSelection()[0].date).yyyymmdd()] ? $('#malware').removeClass('btn-default').addClass('btn-primary') : $('#spyware').removeClass('btn-default').addClass('btn-primary');
        }else{
            console.log(virusChart.getSelection(),new Date(virusChart.getSelection()[0].date).yyyymmdd());
            console.log(virusData[new Date(virusChart.getSelection()[0].date).yyyymmdd()]);
            //virusChart.setSelection(null);
        }
    }
}
function threatReady(){
    $('#chart2 text:contains(Threat)').css('font-size','20px');
    for(var i = 0 ; i < months.length ; i++){
        threatMonthData[i].length > 0 ? $('#chart2 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        }).text(months[i] +'['+ threatMonthData[i].length + ']') : $('#chart2 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        });
    }
    google.visualization.events.addListener(threatChart, 'select', threatHandler);
}
function threatHandler(e) {
    if(threatChart.getSelection().length == 1){
        if(threatData[new Date(threatChart.getSelection()[0].date).yyyymmdd()]){
            $('#virusButtons').hide();
            $('.modal-title').text('Vulnerability Attacks');
            $('#table').fadeIn();
            $('#tableHead').html('')
                .append($('<th>').text('TIMESTAMP'))
                .append($('<th>').text('CATEGORY'))
                .append($('<th>').text('VUL_NAME'))
                .append($('<th>').text('ATTACKERADDRESS'))
                .append($('<th>').text('IPADDRESS'))
                .append($('<th>').text('ACTION'))
                .append($('<th>').text('DEVICEHOSTNAME'))
                .append($('<th>').text('LOCATION'))
                .append($('<th>').text('SUMAGG'));
            $('#tableBody').html('');
            for(var i = 0 ;each = threatData[new Date(threatChart.getSelection()[0].date).yyyymmdd()][i] ; i++){
                var tr = $('<tr>');
                $('#tableBody').append(tr);
                tr.append($('<td>').text(each['timestamp']))
                tr.append($('<td>').text(each['category']))
                tr.append($('<td>').text(each['vul_name']))
                tr.append($('<td>').text(each['attackeraddress']))
                tr.append($('<td>').text(each['ipaddress']))
                tr.append($('<td>').text(each['action']))
                tr.append($('<td>').text(each['devicehostname']))
                tr.append($('<td>').text(each['location']))
                tr.append($('<td>').text(each['sumagg']));
            }
            //threatChart.setSelection(null);
            setHeight();
        }else{
            console.log(threatChart.getSelection(),new Date(threatChart.getSelection()[0].date).yyyymmdd());
            console.log(threatData[new Date(threatChart.getSelection()[0].date).yyyymmdd()]);
            //threatChart.setSelection(null);
        }        
    }
}
function vpnReady(){
    $('#chart3 text:contains(VPN)').css('font-size','20px');
    for(var i = 0 ; i < months.length ; i++){
        vpnMonthData[i].length > 0 ? $('#chart3 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        }).text(months[i] +'['+ vpnMonthData[i].length + ']') : $('#chart3 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        });
    }
    google.visualization.events.addListener(vpnChart, 'select', vpnHandler);
}
function vpnHandler(e) {
    if(vpnChart.getSelection().length == 1){
        if(vpnData[new Date(vpnChart.getSelection()[0].date).yyyymmdd()]){
            $('#virusButtons').hide();
            $('.modal-title').text('VPN Attacks');
            $('#table').fadeIn();
            $('#tableHead').html('')
                .append($('<th>').text('UserName'))
                .append($('<th>').text('ipAddess'))
                .append($('<th>').text('creationTime'))
                .append($('<th>').text('attackCount'))
                .append($('<th>').text('latitude'))
                .append($('<th>').text('longitude'))
                .append($('<th>').text('city'))
                .append($('<th>').text('country'))
                .append($('<th>').text('listStatus'));
            $('#tableBody').html('');
            for(var i = 0 ;each = vpnData[new Date(vpnChart.getSelection()[0].date).yyyymmdd()][i] ; i++){
                var tr = $('<tr>');
                $('#tableBody').append(tr);
                tr.append($('<td>').text(each['username']))
                tr.append($('<td>').text(each['ipaddess']))
                tr.append($('<td>').text(each['creationtime']))
                tr.append($('<td>').text(each['attackcount']))
                tr.append($('<td>').text(each['latitude']))
                tr.append($('<td>').text(each['longitude']))
                tr.append($('<td>').text(each['city']))
                tr.append($('<td>').text(each['country']))
                tr.append($('<td>').text(each['listStatus']));
            }
            //vpnChart.setSelection(null);
            setHeight();
        }else{
            console.log(vpnChart.getSelection(),new Date(vpnChart.getSelection()[0].date).yyyymmdd());
            console.log(vpnData[new Date(vpnChart.getSelection()[0].date).yyyymmdd()]);
            //vpnChart.setSelection(null);
        }
    }
}
function ticketReady(){
    $('#chart4 text:contains(HPSM Tickets)').css('font-size','20px');
    for(var i = 0 ; i < months.length ; i++){
        ticketMonthData[i].length > 0 ? $('#chart4 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        }).text(months[i] +'['+ ticketMonthData[i].length + ']') : $('#chart4 text:contains(' + months[i] + ')').css({
            fontSize : '12px'
        });
    }
    google.visualization.events.addListener(ticketChart, 'select', ticketHandler);
}
function ticketHandler(e) {
    if(ticketChart.getSelection().length == 1){
        if(ticketData[new Date(ticketChart.getSelection()[0].date).yyyymmdd()]){
            $('#virusButtons').hide();
            $('.modal-title').text('Virus Attacks');
            $('#table').fadeIn();
            $('#tableHead').html('')
                .append($('<th>').text('Sl_No'))
                .append($('<th>').text('Date'))
                .append($('<th>').text('case_no'))
                .append($('<th>').text('Case_title'))
                .append($('<th>').text('location'))
                .append($('<th>').text('Types_of_Attack'))
                .append($('<th>').text('priority'))
                .append($('<th>').text('Engineer_Name'))
                .append($('<th>').text('Pending_with'))
                .append($('<th>').text('Status'))
                .append($('<th>').text('Comments'));
            $('#tableBody').html('');
            for(var i = 0 ;each = ticketData[new Date(ticketChart.getSelection()[0].date).yyyymmdd()][i] ; i++){
                var tr = $('<tr>');
                $('#tableBody').append(tr);
                tr.append($('<td>').text(each['sl_no']))
                tr.append($('<td>').text(each['date']))
                tr.append($('<td>').text(each['case_no']))
                tr.append($('<td>').text(each['case_title']))
                tr.append($('<td>').text(each['location']))
                tr.append($('<td>').text(each['types_of_attack']))
                tr.append($('<td>').text(each['priority']))
                tr.append($('<td>').text(each['engineer_name']))
                tr.append($('<td>').text(each['pending_with']))
                tr.append($('<td>').text(each['status']))
                tr.append($('<td>').text(each['comments']));
            }
            //ticketChart.setSelection(null);
            setHeight();
        }else{
            console.log(ticketChart.getSelection(),new Date(ticketChart.getSelection()[0].date).yyyymmdd());
            console.log(ticketData[new Date(ticketChart.getSelection()[0].date).yyyymmdd()]);
            //ticketChart.setSelection(null);
        }
    }
}
function getHeight(years){
	console.log(arguments.callee.caller,years);
	return ($('.cont').width()/58 * 7 * (years.length || 1) + 150);
}
function loadData() {
    $.ajax({
        url: xmlPath + 'MalwareReports_Bulk.xml',
        dataType: 'text',
        success: function (data) {
			var years = [];
            data = parser(data);
            var newXML = document.createElement('div');
            newXML.innerHTML = data.documentElement.innerHTML;
            var chartData = [
            ];
            for (var i = 0; each = data.documentElement.getElementsByTagName('MalwareReports')[i]; i++) {
                var date = new Date(each.getElementsByTagName('Timestamp')[0].innerHTML);
                if(date){
					if(years.indexOf(date.getFullYear()) == -1){
						years.push(date.getFullYear());
					}
                    if (!virusData[date.yyyymmdd()]) {
                        virusData[date.yyyymmdd()] = [];
                        malware[date.yyyymmdd()] = [];
                    }
                    var obj = {};
                    $(each).children().each(function(i,e){
                        obj[e.tagName.toLowerCase()] = e.textContent;
                    });
                    virusData[date.yyyymmdd()].push(obj);
                    malware[date.yyyymmdd()].push(obj);
                    virusMonthData[date.getMonth()].push(obj);
                    chartData.push([date,virusData[date.yyyymmdd()].length]);
                }
            }
            $.ajax({
                url: xmlPath + 'SPYWare_Bulk.xml',
                dataType: 'text',
                success: function (data1) {
                    data1 = parser(data1);
                    var newXML = document.createElement('div');
                    newXML.innerHTML = data1.documentElement.innerHTML;
                    for (var i = 0; each = data1.documentElement.getElementsByTagName('SPYWare')[i]; i++) {
                        var date = new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML);
						if(date){
							if(years.indexOf(date.getFullYear()) == -1){
								years.push(date.getFullYear());
							}
                            if (!virusData[date.yyyymmdd()]) {
                                virusData[date.yyyymmdd()] = [];
                            }
                            if (!spyware[date.yyyymmdd()]) {
                                spyware[date.yyyymmdd()] = [];
                            }
                            var obj = {};
                            $(each).children().each(function(i,e){
                                obj[e.tagName.toLowerCase()] = e.textContent;
                            });
                            virusData[date.yyyymmdd()].push(obj);
                            spyware[date.yyyymmdd()].push(obj);
                            virusMonthData[date.getMonth()].push(obj);
                            chartData.push([date,virusData[date.yyyymmdd()].length]);
                        }
                    }
                    chartOptions.title = 'Virus';
                    virusDataTable = new google.visualization.DataTable();
                    virusDataTable.addColumn({ type: 'date', id: 'Date' });
                    virusDataTable.addColumn({ type: 'number', id: 'Tickets' });
                    virusDataTable.addRows(chartData);
                    virusChart = new google.visualization.Calendar(document.getElementById('chart1'));
                    google.visualization.events.addListener(virusChart, 'ready', virusReady);
                    document.getElementById('chart1').style.height = getHeight(years) + 'px';
                    virusChart.draw(virusDataTable, chartOptions);
					hideLoader();
					/*setTimeout(function(){
						chartOptions.title = 'Virus';
						$('#chart1').height($('#chart1 g').get(1).getBoundingClientRect().height + 20);
						virusChart.draw(virusDataTable, chartOptions);
					},100);*/
                }
            });

        },
        error: function () {
        }
    });
    $.ajax({
        url : xmlPath + 'Vulnerabilty_Bulk.xml',
        dataType: 'text',
        success: function (data) {
			var years = [];
            data = parser(data);
            var newXML = document.createElement('div');
            newXML.innerHTML = data.documentElement.innerHTML;
            var chartData = [
            ];
            for (var i = 0; each = data.documentElement.getElementsByTagName('Vulnerabilty')[i]; i++) {
                var date = new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML);
				if(date){
					if(years.indexOf(date.getFullYear()) == -1){
						years.push(date.getFullYear());
					}
                    if (!threatData[date.yyyymmdd()]) {
                        threatData[date.yyyymmdd()] = [];
                    }
                    var obj = {};
                    $(each).children().each(function(i,e){
                        obj[e.tagName.toLowerCase()] = e.textContent;
                    });
                    threatData[date.yyyymmdd()].push(obj);
                    threatMonthData[date.getMonth()].push(obj);
                    chartData.push([date,threatData[date.yyyymmdd()].length]);
                }
            }
            chartOptions.title = 'Threat';
            threatDataTable = new google.visualization.DataTable();
            threatDataTable.addColumn({ type: 'date', id: 'Date' });
            threatDataTable.addColumn({ type: 'number', id: 'Tickets' });
            threatDataTable.addRows(chartData);
            threatChart = new google.visualization.Calendar(document.getElementById('chart2'));
            google.visualization.events.addListener(threatChart, 'ready', threatReady);
            document.getElementById('chart2').style.height = getHeight(years) + 'px';
            threatChart.draw(threatDataTable, chartOptions);
			hideLoader();
        },
        error : function(){
        }
    });
    $.ajax({
        url : xmlPath + 'VPN_Bulk.xml',
        dataType: 'text',
        success: function (data) {
			var years = [];
            data = parser(data);
            var newXML = document.createElement('div');
            newXML.innerHTML = data.documentElement.innerHTML;
            var chartData = [
            ];
            for (var i = 0; each = data.documentElement.getElementsByTagName('WorldMap')[i]; i++) {
                var parts = each.getElementsByTagName('creationTime')[0].innerHTML.split("/");
                var date = new Date(parseInt(parts[2], 10),
                                  parseInt(parts[1], 10) - 1,
                                  parseInt(parts[0], 10));
				if(date){
					if(years.indexOf(date.getFullYear()) == -1){
						years.push(date.getFullYear());
					}
                    if (!vpnData[date.yyyymmdd()]) {
                        vpnData[date.yyyymmdd()] = [];
                    }
                    var obj = {};
                    $(each).children().each(function(i,e){
                        obj[e.tagName.toLowerCase()] = e.textContent;
                    });
                    vpnData[date.yyyymmdd()].push(obj);
                    vpnMonthData[date.getMonth()]? vpnMonthData[date.getMonth()].push(obj) : '';
                    chartData.push([date,vpnData[date.yyyymmdd()].length]);
                }
            }
            chartOptions.title = 'VPN';
            vpnDataTable = new google.visualization.DataTable();
            vpnDataTable.addColumn({ type: 'date', id: 'Date' });
            vpnDataTable.addColumn({ type: 'number', id: 'Tickets' });
            vpnDataTable.addRows(chartData);
            vpnChart = new google.visualization.Calendar(document.getElementById('chart3'));
            google.visualization.events.addListener(vpnChart, 'ready', vpnReady);
            document.getElementById('chart3').style.height = getHeight(years) + 'px';
            vpnChart.draw(vpnDataTable, chartOptions);
            hideLoader();
        },
        error : function(){
        }
    });
    $.ajax({
        url : xmlPath + 'HPSM_Tickets_Bulk.xml',
        dataType: 'text',
        success: function (data) {
			var years = [];
            data = parser(data);
            var newXML = document.createElement('div');
            newXML.innerHTML = data.documentElement.innerHTML;
            var chartData = [
            ];
            for (var i = 0; each = data.documentElement.getElementsByTagName('HPSMTickets')[i]; i++) {
                var date = new Date(each.getElementsByTagName('Date')[0].innerHTML);
				if(date){
					if(years.indexOf(date.getFullYear()) == -1){
						years.push(date.getFullYear());
					}
                    if (!ticketData[date.yyyymmdd()]) {
                        ticketData[date.yyyymmdd()] = [];
                    }
                    var obj = {};
                    $(each).children().each(function(i,e){
                        obj[e.tagName.toLowerCase()] = e.textContent;
                    });
                    ticketData[date.yyyymmdd()].push(obj);
                    ticketMonthData[date.getMonth()].push(obj);
                    chartData.push([date,ticketData[date.yyyymmdd()].length]);
                }
            }
            chartOptions.title = 'HPSM Tickets';
            ticketDataTable = new google.visualization.DataTable();
            ticketDataTable.addColumn({ type: 'date', id: 'Date' });
            ticketDataTable.addColumn({ type: 'number', id: 'Tickets' });
            ticketDataTable.addRows(chartData);
            ticketChart = new google.visualization.Calendar(document.getElementById('chart4'));
            google.visualization.events.addListener(ticketChart, 'ready', ticketReady);
            document.getElementById('chart4').style.height = getHeight(years) + 'px';
            ticketChart.draw(ticketDataTable, chartOptions);
            hideLoader();
        },
        error : function(){
        }
    });
}
function closePop(){
    $('#table').fadeOut();
}

function drawChart() {
    chartOptions = {
        title: "Calendar Chart",
        colorAxis :  {minValue: 0,  colors: ['#FBDD00','#FC0D06']},
        legend : 'none',
        calendar: { cellSize: $('.cont').width()/58 }
        
    };
    $('.close').on('click',closePop);
    loadData();
    $('#virusButtons input').on('click',virusButtons);
}
/*
virus : 
MalwareReports_Bulk
SPYWare_Bulk
threat :
Vulnerabilty_Bulk
vpn : 
VPN_Bulk
hpsm :
HPSM_Tickets_Bulk
*/