/**
 * Created by Rama Chinta on 5/17/2015.
 */
var virusOdo,
	threatOdo,
	vpnOdo,
	ipOdo,
	loadInterval,
	locations = {
		'DOF_HQ': 0,
		'DOF_DR': 0,
		'ADAC': 0,
		'KPDC': 0,
		'Mina': 0,
		'Sila': 0,
		'Mezyad': 0
	},
	locationsObj = {},
	networkVirusCount = 0,
	endUserVirusCount = 0,
	threatCount = 0,
	VPNCount = 0,
	publicIPCount = 0,
	globeldata = {
		xmlResultData: []
	},
	networkVirusChart,
	endUserVirusChart,
	threatChart,
	VPNChart,
	publicIPChart,
	options,
	networkVirusData = {},
	endUserVirusData = {},
	threatData = {},
	VPNData = {},
	publicIPData = {},
	chartVar,
	chartData,
	ajaxUrl = 'XMLFiles/',
	exceptions = {
		'publicip': ['username', 'latitude', 'longitude', 'country', 'liststatus', 'imagepath'],
		'vpn': ['attackcount', 'latitude', 'longitude', 'imagepath'],
		'threat': ['category', 'attackeraddress', 'devicehostname', 'sumagg']
	};
function getActual(x) {
	return window['inner'+x] ||
		document.documentElement['client'+x]||
		document.body['client'+x]||
		document.body['offset'+x];
}
function hasResponses(datasource) {
	return datasource.length - 1;
}
function parser(data) {
	var rex = /(\<(\/)?[A-Za-z0-9]+\>)(\s)+/gi;
	data = data.replace(rex, "$1");
	return $.parseXML(data);
}
function loadCustomData() {
	$('#loaderDiv').fadeIn();
	var from = new Date(document.getElementById('fromDate').value),
		to = new Date(document.getElementById('toDate').value);
	$.ajax({//5
		url: ajaxUrl + 'HPSM_Tickets_Bulk.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[5] = [];
			locationsObj = {};
			if (data instanceof Object) {
				if (data.documentElement) {
					for (var i = 0; each = data.documentElement.getElementsByTagName('HPSMTickets')[i]; i++) {
						if (!locationsObj[each.getElementsByTagName('location')[0].innerHTML]) {
							locationsObj[each.getElementsByTagName('location')[0].innerHTML] = 0;
						}
						if (from.getTime() <= new Date(each.getElementsByTagName('Date')[0].innerHTML).getTime() &&
							new Date(each.getElementsByTagName('Date')[0].innerHTML).getTime() <= to.getTime()) {
							++locationsObj[each.getElementsByTagName('location')[0].innerHTML];
							globeldata.xmlResultData[5].push(each);
						}
					}
					delete i;
					for (var i in locations) {
						$('#' + i).attr('class', locationsObj[i] ? 'row red' : 'row green').find('.text .pop').html(locationsObj[i] ? locationsObj[i] : 0);
					}
					delete i;
				}
			}
			delete locationsObj;
			delete newXML;
			delete from;
			delete to;
			delete globeldata;
			delete networkVirusChart;
			delete endUserVirusChart;
			delete threatChart;
			delete VPNChart;
			delete  publicIPChart;
			delete networkVirusData;
			delete endUserVirusData;
			delete threatData;
			delete VPNData;
			delete publicIPData;
			delete options;
			delete virusOdo;
			delete threatOdo;
			delete vpnOdo;
			delete ipOdo;
			delete chartVar;
		},
		error: function () {
		}
	});
	$.ajax({//network virus 0
		url: ajaxUrl + 'SPYWare_Bulk.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[0] = [];
			var newXML = document.createElement('div');
			newXML.innerHTML = data.documentElement.innerHTML;
			var obj = {};
			networkVirusCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('SPYWare')[i]; i++) {
				if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
					obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
				}
				if (from.getTime() <= new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML).getTime() &&
					new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML).getTime() <= to.getTime()) {
					++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
					++networkVirusCount;
					globeldata.xmlResultData[0].push(each);
				}
			}
			delete obj;
			$.ajax({
				url: ajaxUrl + 'SecurityAV_2.xml',
				dataType: 'text',
				success: function (data1) {
					data1 = parser(data1);
					newXML.innerHTML = data.documentElement.innerHTML + data1.documentElement.innerHTML;
					globeldata.xmlResultData[0] = newXML;
					for (var i = 0; each = data1.documentElement.getElementsByTagName('SPYWare')[i]; i++) {
						if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
							obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
						}
						if (from.getTime() <= new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML).getTime() &&
							new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML).getTime() <= to.getTime()) {
							++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
							++networkVirusCount;
							globeldata.xmlResultData[0].push(data1);
						}
					}
					networkVirusData = [
						['Location', 'Virus Count']
					];
					for (var i in obj) {
						if (obj[i] > 0)
							networkVirusData.push([i, obj[i]]);
					}
					if ((networkVirusCount + endUserVirusCount) == 0) {
						$('#virus').addClass('inactive');
					} else {
						$('#virus').removeClass('inactive');
					}
					$('#virus .pop').text(networkVirusCount + endUserVirusCount);
					if (hasResponses(networkVirusData)) {
						networkVirusChart = new google.visualization.PieChart(document.getElementById('chart1'));
						networkVirusChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
					} else {
						document.getElementById('chart1').innerHTML = '<div class="nodata">No Data</div>';
					}
					delete obj;
				},
				error: function () {
				}
			});
			delete newXML;
			delete from;
			delete to;
			delete globeldata;
			delete networkVirusChart;
			delete endUserVirusChart;
			delete threatChart;
			delete VPNChart;
			delete  publicIPChart;
			delete networkVirusData;
			delete endUserVirusData;
			delete threatData;
			delete VPNData;
			delete publicIPData;
			delete options;
			delete virusOdo;
			delete threatOdo;
			delete vpnOdo;
			delete ipOdo;
			delete chartVar;
		},
		error: function () {
		}
	});
	$.ajax({//enduser virus 1
		url: ajaxUrl + 'MalwareReports_Bulk.xml',
		dataType: 'text',
		success: function (data2) {
			data2 = parser(data2);
			globeldata.xmlResultData[1] = [];
			var obj = {};
			endUserVirusCount = 0;
			for (var i = 0; each = data2.documentElement.getElementsByTagName('MalwareReports')[i]; i++) {
				if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
					obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
				}
				if (from.getTime() <= new Date(each.getElementsByTagName('Timestamp')[0].innerHTML).getTime() &&
					new Date(each.getElementsByTagName('Timestamp')[0].innerHTML).getTime() <= to.getTime()) {
					++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
					++endUserVirusCount;
					globeldata.xmlResultData[1].push(each);
				}
			}
			endUserVirusData = [
				['Location', 'Virus Count']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					endUserVirusData.push([i, obj[i]]);
			}
			if ((networkVirusCount + endUserVirusCount) == 0) {
				$('#virus').addClass('inactive');
			} else {
				$('#virus').removeClass('inactive');
			}
			$('#virus .pop').text(networkVirusCount + endUserVirusCount);
			if (hasResponses(endUserVirusData)) {
				endUserVirusChart = new google.visualization.PieChart(document.getElementById('chart2'));
				endUserVirusChart.draw(google.visualization.arrayToDataTable(endUserVirusData), options);
			} else {
				document.getElementById('chart2').innerHTML = '<div class="nodata">No Data</div>';
			}
			setTimeout(function () {
				virusOdo.innerHTML = networkVirusCount + endUserVirusCount;
			}, 1000);
			delete obj;
		},
		error: function () {
		}
	});
	$.ajax({//threat 3
		url: ajaxUrl + 'Vulnerabilty_Bulk.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[3] = [];
			var obj = {};
			threatCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('Vulnerabilty')[i]; i++) {
				if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
					obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
				}
				if (from.getTime() <= new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML).getTime() &&
					new Date(each.getElementsByTagName('TIMESTAMP')[0].innerHTML).getTime() <= to.getTime()) {
					++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
					++threatCount;
					globeldata.xmlResultData[3].push(each);
				}
			}
			threatData = [
				['Location', 'Virus Count']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					threatData.push([i, obj[i]]);
			}
			if (threatCount == 0) {
				$('#threat').addClass('inactive');
			} else {
				$('#threat').removeClass('inactive');
			}
			$('#threat .pop').text(threatCount);
			if (hasResponses(threatData)) {
				threatChart = new google.visualization.PieChart(document.getElementById('chart3'));
				threatChart.draw(google.visualization.arrayToDataTable(threatData), options);
			} else {
				document.getElementById('chart3').innerHTML = '<div class="nodata">No Data</div>';
			}
			setTimeout(function () {
				threatOdo.innerHTML = threatCount;
			}, 1000);
			delete obj;
		},
		error: function () {
		}
	});
	$.ajax({//vpn 4
		url: ajaxUrl + 'VPN_Bulk.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[4] = [];
			var obj = {};
			VPNCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('WorldMap')[i]; i++) {
				if (!obj[each.getElementsByTagName('country')[0].innerHTML]) {
					obj[each.getElementsByTagName('country')[0].innerHTML] = 0;
				}
				if (from.getTime() <= new Date(each.getElementsByTagName('creationTime')[0].innerHTML.split('/').reverse().join('/')).getTime() &&
					new Date(each.getElementsByTagName('creationTime')[0].innerHTML.split('/').reverse().join('/')).getTime() <= to.getTime()) {
					++obj[each.getElementsByTagName('country')[0].innerHTML];
					++VPNCount;
					globeldata.xmlResultData[4].push(each);
				}
			}
			VPNData = [
				['Country', 'Connections']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					VPNData.push([i, obj[i]]);
			}
			$('#vpn .pop').text(VPNCount);
			if (VPNCount == 0) {
				$('#vpn').addClass('inactive');
			} else {
				$('#vpn').removeClass('inactive');
			}
			if (hasResponses(VPNData)) {
				VPNChart = new google.visualization.PieChart(document.getElementById('chart4'));
				VPNChart.draw(google.visualization.arrayToDataTable(VPNData), options);
			} else {
				document.getElementById('chart4').innerHTML = '<div class="nodata">No Data</div>'
			}
			setTimeout(function () {
				vpnOdo.innerHTML = VPNCount;
			}, 1000);
			$('#loaderDiv').fadeOut();
			delete obj;
		},
		error: function () {
		}
	});
	$.ajax({//pulic ip 2
		url: ajaxUrl + 'PublicIP_Bulk.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[2] = [];
			var obj = {};
			publicIPCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('WorldMap')[i]; i++) {
				if (!obj[each.getElementsByTagName('city')[0].innerHTML]) {
					obj[each.getElementsByTagName('city')[0].innerHTML] = 0;
				}
				if (from.getTime() <= new Date(each.getElementsByTagName('creationTime')[0].innerHTML.split('/').reverse().join('/')).getTime() &&
					new Date(each.getElementsByTagName('creationTime')[0].innerHTML.split('/').reverse().join('/')).getTime() <= to.getTime()) {
					++obj[each.getElementsByTagName('city')[0].innerHTML];
					++publicIPCount;
					globeldata.xmlResultData[2].push(each);
				}
			}
			publicIPData = [
				['Location', 'Connections']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					publicIPData.push([i, obj[i]]);
			}
			$('#publicip .pop').text(publicIPCount);
			if (publicIPCount == 0) {
				$('#publicip').addClass('inactive');
			} else {
				$('#publicip').removeClass('inactive');
			}
			if (hasResponses(publicIPData)) {
				publicIPChart = new google.visualization.PieChart(document.getElementById('chart5'));
				publicIPChart.draw(google.visualization.arrayToDataTable(publicIPData), options);
			} else {
				document.getElementById('chart5').innerHTML = '<div class="nodata">No Data</div>'
			}
			setTimeout(function () {
				ipOdo.innerHTML = publicIPCount;
			}, 1000);
			delete obj;
			$('#loaderDiv').fadeOut();
		},
		error: function () {
		}
	});
	$('#popup,#modal,#error').removeClass('active');
	$('#online').removeClass('active');
	$('#custom').addClass('active');
	delete from;
	delete to;
	delete globeldata;
	delete networkVirusChart;
	delete endUserVirusChart;
	delete threatChart;
	delete VPNChart;
	delete  publicIPChart;
	delete networkVirusData;
	delete endUserVirusData;
	delete threatData;
	delete VPNData;
	delete publicIPData;
	delete options;
	delete virusOdo;
	delete threatOdo;
	delete vpnOdo;
	delete ipOdo;
	delete chartVar;
}
function loadData() {
	$.ajax({//5
		url: ajaxUrl + 'HPSMTicketsMonthNew.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[5] = data;
			if (data instanceof Object) {
				if (data.documentElement) {
					locationsObj = {};
					for (var i = 0; each = data.documentElement.getElementsByTagName('HPSMTickets')[i]; i++) {
						if (!locationsObj[each.getElementsByTagName('location')[0].innerHTML]) {
							locationsObj[each.getElementsByTagName('location')[0].innerHTML] = 0;
						}
						if(each.getElementsByTagName('Status')[0].innerHMTL = 'Follow up'){
							++locationsObj[each.getElementsByTagName('location')[0].innerHTML];
						}
					}
					for (var i in locations) {
						$('#' + i).attr('class', locationsObj[i] ? 'row red' : 'row green').find('.text .pop').html(locationsObj[i] ? locationsObj[i] : 0);
					}
				}
			}
		},
		error: function () {
		}
	});
	$.ajax({//network virus 0
		url: ajaxUrl + 'SPYWare.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[0] = data;
			var newXML = document.createElement('div');
			newXML.innerHTML = data.documentElement.innerHTML;
			var obj = {};
			networkVirusCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('SPYWare')[i]; i++) {
				if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
					obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
				}
				++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
				++networkVirusCount;
			}
			$.ajax({
				url: ajaxUrl + 'SecurityAV.xml',
				dataType: 'text',
				success: function (data1) {
					data1 = parser(data1);
					newXML.innerHTML = data.documentElement.innerHTML + data1.documentElement.innerHTML;
					globeldata.xmlResultData[0] = newXML;
					for (var i = 0; each = data1.documentElement.getElementsByTagName('SPYWare')[i]; i++) {
						if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
							obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
						}
						++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
						++networkVirusCount;
					}
					networkVirusData = [
						['Location', 'Virus Count']
					];
					for (var i in obj) {
						if (obj[i] > 0)
							networkVirusData.push([i, obj[i]]);
					}
					$('#virus .pop').text(networkVirusCount + endUserVirusCount);
					if ((networkVirusCount + endUserVirusCount) == 0) {
						$('#virus').addClass('inactive');
					} else {
						$('#virus').removeClass('inactive');
					}
					if (hasResponses(networkVirusData)) {
						networkVirusChart = new google.visualization.PieChart(document.getElementById('chart1'));
						networkVirusChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
					} else {
						document.getElementById('chart1').innerHTML = '<div class="nodata">No Data</div>'
					}
				},
				error: function () {
				}
			});
		},
		error: function () {
		}
	});
	$.ajax({//enduser virus 1
		url: ajaxUrl + 'MalwareReport.xml',
		dataType: 'text',
		success: function (data2) {
			data2 = parser(data2);
			globeldata.xmlResultData[1] = data2;
			var obj = {};
			endUserVirusCount = 0;
			for (var i = 0; each = data2.documentElement.getElementsByTagName('MalwareReports')[i]; i++) {
				if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
					obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
				}
				++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
				++endUserVirusCount;
			}
			endUserVirusData = [
				['Location', 'Virus Count']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					endUserVirusData.push([i, obj[i]]);
			}
			$('#virus .pop').text(networkVirusCount + endUserVirusCount);
			if ((networkVirusCount + endUserVirusCount) == 0) {
				$('#virus').addClass('inactive');
			} else {
				$('#virus').removeClass('inactive');
			}
			if (hasResponses(endUserVirusData)) {
				endUserVirusChart = new google.visualization.PieChart(document.getElementById('chart2'));
				endUserVirusChart.draw(google.visualization.arrayToDataTable(endUserVirusData), options);
			} else {
				document.getElementById('chart2').innerHTML = '<div class="nodata">No Data</div>';
			}
			setTimeout(function () {
				virusOdo.innerHTML = networkVirusCount + endUserVirusCount;
			}, 1000);
		},
		error: function () {
		}
	});
	$.ajax({//threat 3
		url: ajaxUrl + 'Vulnerabilty.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[3] = data;
			var obj = {};
			threatCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('Vulnerabilty')[i]; i++) {
				if (!obj[each.getElementsByTagName('LOCATION')[0].innerHTML]) {
					obj[each.getElementsByTagName('LOCATION')[0].innerHTML] = 0;
				}
				++obj[each.getElementsByTagName('LOCATION')[0].innerHTML];
				++threatCount;
			}
			threatData = [
				['Location', 'Virus Count']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					threatData.push([i, obj[i]]);
			}
			if (threatCount == 0) {
				$('#threat').addClass('inactive');
			} else {
				$('#threat').removeClass('inactive');
			}
			$('#threat .pop').text(threatCount);
			if (hasResponses(threatData)) {
				threatChart = new google.visualization.PieChart(document.getElementById('chart3'));
				threatChart.draw(google.visualization.arrayToDataTable(threatData), options);
			} else {
				document.getElementById('chart3').innerHTML = '<div class="nodata">No Data</div>';
			}
			setTimeout(function () {
				threatOdo.innerHTML = threatCount;
			}, 1000);
		},
		error: function () {
		}
	});
	$.ajax({//vpn 4
		url: ajaxUrl + 'VPN.xml',
		dataType: 'text',
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[4] = data;
			var obj = {};
			VPNCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('WorldMap')[i]; i++) {
				if (!obj[each.getElementsByTagName('country')[0].innerHTML]) {
					obj[each.getElementsByTagName('country')[0].innerHTML] = 0;
				}
				++obj[each.getElementsByTagName('country')[0].innerHTML];
				++VPNCount;
			}
			VPNData = [
				['Country', 'Connections']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					VPNData.push([i, obj[i]]);
			}
			if (VPNCount == 0) {
				$('#vpn').addClass('inactive');
			} else {
				$('#vpn').removeClass('inactive');
			}
			$('#vpn .pop').text(VPNCount);
			if (hasResponses(VPNData)) {
				VPNChart = new google.visualization.PieChart(document.getElementById('chart4'));
				VPNChart.draw(google.visualization.arrayToDataTable(VPNData), options);
			} else {
				document.getElementById('chart4').innerHTML = '<div class="nodata">No Data</div>';
			}
			setTimeout(function () {
				vpnOdo.innerHTML = VPNCount;
			}, 1000);
		},
		error: function () {
		}
	});
	$.ajax({//pulic ip 2
		url: ajaxUrl + 'PublicIP.xml',
		dataType: 'text',
		timeout: 0,
		success: function (data) {
			data = parser(data);
			globeldata.xmlResultData[2] = data;
			var obj = {};
			publicIPCount = 0;
			for (var i = 0; each = data.documentElement.getElementsByTagName('WorldMap')[i]; i++) {
				if (!obj[each.getElementsByTagName('city')[0].innerHTML]) {
					obj[each.getElementsByTagName('city')[0].innerHTML] = 0;
				}
				++obj[each.getElementsByTagName('city')[0].innerHTML];
				++publicIPCount;
			}
			publicIPData = [
				['Location', 'Connections']
			];
			for (var i in obj) {
				if (obj[i] > 0)
					publicIPData.push([i, obj[i]]);
			}
			$('#publicip .pop').text(publicIPCount);
			if (publicIPCount == 0) {
				$('#publicip').addClass('inactive');
			} else {
				$('#publicip').removeClass('inactive');
			}
			if (hasResponses(publicIPData)) {
				publicIPChart = new google.visualization.PieChart(document.getElementById('chart5'));
				publicIPChart.draw(google.visualization.arrayToDataTable(publicIPData), options);
			} else {
				document.getElementById('chart5').innerHTML = '<div class="nodata">No Data</div>';
			}
			setTimeout(function () {
				ipOdo.innerHTML = publicIPCount;
			}, 1000);
			$('#loaderDiv').fadeOut();
		},
		error: function () {
		}
	});
}
function showOnline() {
	if (!$(this).hasClass('active')) {
		$('#custom').removeClass('active');
		$('#online').addClass('active');
		if (!loadInterval) {
			loadData();
			loadInterval = setInterval(loadData, 5000);
		}
	}
}
function showCustom() {
	if (!$(this).hasClass('active')) {
		$('#custom').removeClass('active');
		$('#online').addClass('active');
		$('#popup,#modal').addClass('active');
	}
}
function goCustom() {
	if (document.getElementById('fromDate').value.trim().length > 0 || document.getElementById('toDate').value.trim().length > 0) {
		if (!(new Date(document.getElementById('fromDate').value)).getTime()) {
			$('#error').addClass('active').text('Please enter valid From date');
		} else if (!(new Date(document.getElementById('toDate').value)).getTime()) {
			$('#error').addClass('active').text('Please enter valid To date');
		} else {
			clearInterval(loadInterval);
			loadInterval = undefined;
			loadCustomData();
			$('#popup,#modal,#error').removeClass('active');
		}
	} else {
		$('#error').addClass('active').text('Please fill out the fields');
	}
}
function closePop() {
	$('#popup,#modal,#error').removeClass('active');
}
function prepareTableHead(arr, exc) {
	document.getElementById("tableheader").innerHTML = "";
	globeldata.tableHeads = [];
	var length = 0;
	if (!arr.documentElement) {
		arr.documentElement = {
			childNodes: arr.childNodes || arr
		};
	}
	for (var i = 0; i < arr.documentElement.childNodes[0].childNodes.length; i++) {
		if (arr.documentElement.childNodes[0].childNodes[i].nodeType == 1) {
			exc ? (exceptions[exc].indexOf(arr.documentElement.childNodes[0].childNodes[i].nodeName.toLowerCase()) == -1 ? ++length : false) : ++length;
			//length = length + 1;
		}
	}
	delete i;
	for (var i = 0; i < arr.documentElement.childNodes[0].childNodes.length; i++) {
		if (arr.documentElement.childNodes[0].childNodes[i].nodeType == 1) {
			if (exc) {
				if (exceptions[exc].indexOf(arr.documentElement.childNodes[0].childNodes[i].nodeName.toLowerCase()) == -1) {
					var td = document.createElement("div");
					td.className = "thData";
					td.style.width = (100 / length) - 0.3 + "%";
					td.innerHTML = arr.documentElement.childNodes[0].childNodes[i].nodeName;
					document.getElementById("tableheader").appendChild(td);
					globeldata.tableHeads.push(arr.documentElement.childNodes[0].childNodes[i].nodeName);
					delete td;
				}
			} else {
				var td = document.createElement("div");
				td.className = "thData";
				td.style.width = (100 / length) - 0.3 + "%";
				td.innerHTML = arr.documentElement.childNodes[0].childNodes[i].nodeName;
				document.getElementById("tableheader").appendChild(td);
				globeldata.tableHeads.push(arr.documentElement.childNodes[0].childNodes[i].nodeName);
				delete td;
			}
		}
	}
	delete i;
	delete length;
}
function prepareTableData(arr) {
	document.getElementById("tablebodydata").innerHTML = "";
	for (var i = 0; i < arr.documentElement.childNodes.length; i++) {
		var row = document.createElement("div");
		row.className = "divRow";
		var zoneCount = arr.documentElement.childNodes[i];
		for (var j = 0; j < globeldata.tableHeads.length; j++) {
			var td = document.createElement("div");
			td.className = "divData";
			td.style.width = (100 / globeldata.tableHeads.length) - 0.9 + "%";
			td.appendChild(document.createTextNode(zoneCount.getElementsByTagName(globeldata.tableHeads[j])[0].firstChild.data));
			row.appendChild(td);
			delete td;
		}
		delete j;
		delete zoneCount;
		document.getElementById("tablebodydata").appendChild(row);
		delete row;
	}
}
function onZoneClick() {
	if (!$(this).hasClass('inactive')) {
		$("#tableparentConBack").show();
		$('#tablebodydata').removeAttr('style');
		$('.tableParent').attr('title', $(this).find('span').html());
		$('#tablebodydata').css({
			height: $('#stopProp').height() - $('#tableheader').height()
		});
		$(".buttonsnav").hide();
		if ($(this).find('span').html() == "VPN") {
			prepareTableHead(globeldata.xmlResultData[4], 'vpn');
			prepareTableData(globeldata.xmlResultData[4], 'vpn');
		} else if ($(this).find('span').html() == "Public IP") {
			prepareTableHead(globeldata.xmlResultData[2], 'publicip');
			prepareTableData(globeldata.xmlResultData[2], 'publicip');
		}
		else if ($(this).find('span').html() == "Threat") {
			prepareTableHead(globeldata.xmlResultData[3], 'threat');
			prepareTableData(globeldata.xmlResultData[3], 'threat');
		} else {
			$(".buttonsnav").show();
			$('#tablebodydata').css({
				height: $('#tablebodydata').height() - $('#tableparentConBack .buttonsnav').height() - 20
			});
			$(".bnv").removeClass("default");
			$(".bnv:first-child").addClass("default");
			$("#tableheader").html("");
			$("#tablebodydata").html("");
			prepareTableHead(globeldata.xmlResultData[0]);
			prepareTableData(globeldata.xmlResultData[0]);
		}
	}
	delete globeldata;
}
function closeTable() {
	$('#tablebodydata').html('');
	$('#tableparentConBack').hide();
}
function showChart() {
	$('#chartContainer').fadeIn();
	$('#contentChart').attr('title', $(this).parent().find('.title').text());
	switch (this.getAttribute('id')) {
	case 'chart1':
		chartData = networkVirusData;
		break;
	case 'chart2':
		chartData = endUserVirusData;
		break;
	case 'chart3':
		chartData = threatData;
		break;
	case 'chart4':
		chartData = VPNData;
		break;
	case 'chart5':
		chartData = publicIPData;
		break;
	}
	chartVar = new google.visualization.PieChart(document.getElementById('contentChart'));
	chartVar.draw(google.visualization.arrayToDataTable(chartData), options);
	delete chartData;
	delete networkVirusChart;
	delete endUserVirusChart;
	delete threatChart;
	delete VPNChart;
	delete  publicIPChart;
	delete networkVirusData;
	delete endUserVirusData;
	delete threatData;
	delete VPNData;
	delete publicIPData;
	delete options;
	delete virusOdo;
	delete threatOdo;
	delete vpnOdo;
	delete ipOdo;
	delete chartVar;
	delete globeldata;
}
function closeChart() {
	$('#chartContainer').fadeOut();
	chartVar = undefined;
	delete networkVirusChart;
	delete endUserVirusChart;
	delete threatChart;
	delete VPNChart;
	delete  publicIPChart;
	delete networkVirusData;
	delete endUserVirusData;
	delete threatData;
	delete VPNData;
	delete publicIPData;
	delete options;
	delete virusOdo;
	delete threatOdo;
	delete vpnOdo;
	delete ipOdo;
	delete chartVar;
}
function onLoad() {
	$(".bnv").on("click", function (event) {
		event.stopImmediatePropagation();
		if (!$(this).hasClass("default")) {
			if ($(this).html() == "Network virus") {
				$("#tableheader").html("");
				$("#tablebodydata").html("");
				$(".bnv").removeClass("default");
				$(this).addClass("default");
				prepareTableHead(globeldata.xmlResultData[0]);
				prepareTableData(globeldata.xmlResultData[0]);
			} else {
				$(".bnv").removeClass("default");
				$(this).addClass("default");
				$("#tableheader").html("");
				$("#tablebodydata").html("");
				prepareTableHead(globeldata.xmlResultData[1]);
				prepareTableData(globeldata.xmlResultData[1]);
			}
		}
	});
	document.getElementById('online').addEventListener('click', showOnline);
	document.getElementById('custom').addEventListener('click', showCustom);
	document.getElementById('customGo').addEventListener('click', goCustom);
	document.getElementById('closePop').addEventListener('click', closePop);
	//document.getElementById('modal').addEventListener('click', closePop);
	$('#closeChart').on('click', closeChart);
	$("#nav li").on("click", onZoneClick);
	$('#closeTable').on('click', closeTable);
	$('#online').addClass('active');
	$('#fromDate').datetimepicker({
		minDate: '2014/01/01',
		maxDate: new Date(),
		timepicker: false,
		format: 'm/d/Y',
		onSelectDate: function (ct, $ele) {
			$ele[0].dater = ct;
			if ($ele[0].getAttribute('id') == 'fromDate') {
				$('#toDate').val('').datetimepicker({
					minDate: ct.dateFormat('Y/m/d'),
					maxDate: new Date(),
					timepicker: false,
					format: 'm/d/Y',
					onSelectDate: function (ct, $ele) {
						$ele.datetimepicker('hide');
					}
				});
			}
			$ele.datetimepicker('hide');
		}
	});
	virusOdo = document.getElementById('virusOdo');
	threatOdo = document.getElementById('threatOdo');
	vpnOdo = document.getElementById('vpnOdo');
	ipOdo = document.getElementById('ipOdo');
	showOnline();
	if (getActual('Width') > 1900) {
		$('#nav').addClass('big').ferroMenu({
			drag: false,
			position: 'right-center',
			opened: false,
			margin: 10,
			radius: 240
		});
		$('.ferromenu-controller').addClass('big').css({
			marginTop: '-100px'
		});
	} else {
		$('#nav').ferroMenu({
			drag: false,
			position: 'right-center',
			opened: false,
			margin: 10,
			radius: 110
		});
	}
	setTimeout(function () {
		$.fn.ferroMenu.toggleMenu('#nav');
		$.fn.ferroMenu.refreshMenu()
	}, 5000);
	$('.ferromenu-controller .label').text('Threat Summary');
	new Odometer({
		el: virusOdo,
		value: 000000,
		format: 'd',
		theme: 'digital'
	});
	new Odometer({
		el: threatOdo,
		value: 000000,
		format: 'd',
		theme: 'digital'
	});
	new Odometer({
		el: vpnOdo,
		value: 000000,
		format: 'd',
		theme: 'digital'
	});
	new Odometer({
		el: ipOdo,
		value: 000000,
		format: 'd',
		theme: 'digital'
	});
	networkVirusData = endUserVirusData = threatData = VPNData = publicIPData = [
		['Task', 'Hours per Day'],
		['Sample', 0]
	];
	options = {
		legend: 'none',
		is3D: true,
		backgroundColor: 'transparent',
		pieSliceText: 'label',
		titlePosition: 'none',
		chartArea: {width: "100%", height: "100%"}
	};
	networkVirusChart = new google.visualization.PieChart(document.getElementById('chart1'));
	endUserVirusChart = new google.visualization.PieChart(document.getElementById('chart2'));
	threatChart = new google.visualization.PieChart(document.getElementById('chart3'));
	VPNChart = new google.visualization.PieChart(document.getElementById('chart4'));
	publicIPChart = new google.visualization.PieChart(document.getElementById('chart5'));
	networkVirusChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
	endUserVirusChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
	threatChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
	VPNChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
	publicIPChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
	$('#chart1,#chart2,#chart3,#chart4,#chart5').on('click', showChart);
	delete networkVirusChart;
	delete endUserVirusChart;
	delete threatChart;
	delete VPNChart;
	delete  publicIPChart;
	delete networkVirusData;
	delete endUserVirusData;
	delete threatData;
	delete VPNData;
	delete publicIPData;
	delete options;
	delete virusOdo;
	delete threatOdo;
	delete vpnOdo;
	delete ipOdo;
	delete globeldata;
	(function () {
		var width, height, /*largeHeader,*/ canvas, ctx, points, target, animateHeader = true;
		// Main
		initHeader();
		initAnimation();
		addListeners();
		function initHeader() {
			width = getActual('Width');
			height = getActual('Height');
			target = {x: width / 2, y: height / 2};
			//largeHeader = document.getElementById('large-header');
			//largeHeader.style.height = height + 'px';
			canvas = document.getElementById('demo-canvas');
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext('2d');
			// create points
			points = [];
			for (var x = 0; x < width; x = x + width / 20) {
				for (var y = 0; y < height; y = y + height / 20) {
					var px = x + Math.random() * width / 20;
					var py = y + Math.random() * height / 20;
					var p = {x: px, originX: px, y: py, originY: py};
					points.push(p);
				}
			}
			// for each point find the 5 closest points
			for (var i = 0; i < points.length; i++) {
				var closest = [];
				var p1 = points[i];
				for (var j = 0; j < points.length; j++) {
					var p2 = points[j]
					if (!(p1 == p2)) {
						var placed = false;
						for (var k = 0; k < 5; k++) {
							if (!placed) {
								if (closest[k] == undefined) {
									closest[k] = p2;
									placed = true;
								}
							}
						}
						for (var k = 0; k < 5; k++) {
							if (!placed) {
								if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
									closest[k] = p2;
									placed = true;
								}
							}
						}
					}
				}
				p1.closest = closest;
			}
			// assign a circle to each point
			for (var i in points) {
				var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
				points[i].circle = c;
			}
		}

		// Event handling
		function addListeners() {
			if (!('ontouchstart' in window)) {
				window.addEventListener('mousemove', mouseMove);
			}
			window.addEventListener('scroll', scrollCheck);
			window.addEventListener('resize', resize);
		}

		function mouseMove(e) {
			var posx = posy = 0;
			if (e.pageX || e.pageY) {
				posx = e.pageX;
				posy = e.pageY;
			}
			else if (e.clientX || e.clientY) {
				posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			target.x = posx;
			target.y = posy;
		}

		function scrollCheck() {
			if (document.body.scrollTop > height) animateHeader = false;
			else animateHeader = true;
		}

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			//largeHeader.style.height = height + 'px';
			canvas.width = width;
			canvas.height = height;
		}

		// animation
		function initAnimation() {
			animate();
			for (var i in points) {
				shiftPoint(points[i]);
			}
		}

		function animate() {
			if (animateHeader) {
				ctx.clearRect(0, 0, width, height);
				for (var i in points) {
					// detect points in range
					if (Math.abs(getDistance(target, points[i])) < 4000) {
						points[i].active = 0.3;
						points[i].circle.active = 0.6;
					} else if (Math.abs(getDistance(target, points[i])) < 20000) {
						points[i].active = 0.1;
						points[i].circle.active = 0.3;
					} else if (Math.abs(getDistance(target, points[i])) < 40000) {
						points[i].active = 0.02;
						points[i].circle.active = 0.1;
					} else {
						points[i].active = 0;
						points[i].circle.active = 0;
					}
					drawLines(points[i]);
					points[i].circle.draw();
				}
			}
			requestAnimationFrame(animate);
		}

		function shiftPoint(p) {
			TweenLite.to(p, 1 + 1 * Math.random(), {
				x: p.originX - 50 + Math.random() * 100,
				y: p.originY - 50 + Math.random() * 100, ease: Circ.easeInOut,
				onComplete: function () {
					shiftPoint(p);
				}
			});
		}

		// Canvas manipulation
		function drawLines(p) {
			if (!p.active) return;
			for (var i in p.closest) {
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(p.closest[i].x, p.closest[i].y);
				ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
				ctx.stroke();
			}
		}

		function Circle(pos, rad, color) {
			var _this = this;
			// constructor
			(function () {
				_this.pos = pos || null;
				_this.radius = rad || null;
				_this.color = color || null;
			})();
			this.draw = function () {
				if (!_this.active) return;
				ctx.beginPath();
				ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
				ctx.fillStyle = 'rgba(156,217,249,' + _this.active + ')';
				ctx.fill();
			};
		}

		// Util
		function getDistance(p1, p2) {
			return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
		}
	})();
}
function onResize() {
	if (networkVirusChart)
		networkVirusChart.draw(google.visualization.arrayToDataTable(networkVirusData), options);
	if (endUserVirusChart)
		endUserVirusChart.draw(google.visualization.arrayToDataTable(endUserVirusData), options);
	if (threatChart)
		threatChart.draw(google.visualization.arrayToDataTable(threatData), options);
	if (VPNChart)
		VPNChart.draw(google.visualization.arrayToDataTable(VPNData), options);
	if (publicIPChart)
		publicIPChart.draw(google.visualization.arrayToDataTable(publicIPData), options);
	if (chartVar)
		chartVar.draw(google.visualization.arrayToDataTable(chartData), options);
	delete networkVirusChart;
	delete endUserVirusChart;
	delete threatChart;
	delete VPNChart;
	delete  publicIPChart;
	delete networkVirusData;
	delete endUserVirusData;
	delete threatData;
	delete VPNData;
	delete publicIPData;
	delete options;
	delete virusOdo;
	delete threatOdo;
	delete vpnOdo;
	delete ipOdo;
	delete globeldata;
}
window.addEventListener('load', onLoad);
window.addEventListener('resize', onResize);