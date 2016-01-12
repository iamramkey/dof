var publicData = [],
	vpnData = [],
	dofData = {
		attackCount: "0",
		city: "ABU DHABI",
		country: "UNITED ARAB EMIRATES",
		creationTime: "2015-02-02 9:17:00 AM",
		destinationPort: "HQ",
		ipAddress: "DOF",
		ipAddressTarget: "DOF",
		latitude: "24.492689",
		longitude: "54.359386",
		userName: "Check"
	},
	positions = {},
	currentScreen = 'PublicIP',
	markersList = [];
function parser(data) {
	return $.parseXML(data.replace(/(\<(\/)?[A-Za-z0-9]+\>)(\s)+/gi, "$1"));
}
function getContent(markerData) {
	return '<h1 class="infoTitle">' + markerData.ipAddress + ', ' + markerData.city + '</h1>' +
		'<div class="infoDetail">' +
		'<span>Ip Address :</span><span>' + markerData.ipAddress + '</span>' +
		'</div>' +
		'<div class="infoDetail">' +
		'<span>User Name :</span><span>' + markerData.userName + '</span>' +
		'</div>' +
		'<div class="infoDetail">' +
		'<span>Country :</span><span>' + markerData.country + '</span>' +
		'</div>' +
		'<div class="infoDetail">' +
		'<span>City :</span><span>' + markerData.city + '</span>' +
		'</div>' +
		'<div class="infoDetail">' +
		'<span>Creation Time :</span><span>' + new Date(markerData.creationTime).toLocaleDateString() + '</span>' +
		'</div>' +
		'<div class="infoDetail">' +
		'<span>Attack Count :</span><span>' + markerData.attackCount + '</span>' +
		'</div>' +
		'<div class="infoDetail">' +
		'<span>Latitude :</span><span>' + markerData.latitude + '</span>' +
		'</div>' +
		'<div class="infoDetail">' +
		'<span>Longitude :</span><span>' + markerData.longitude + '</span>' +
		'</div>';
}
var prevMarker;
function createMarker(markerData, a, i, m) {
	m = new google.maps.Marker({
		position: markerData.latLng,
		title: markerData.city + ', ' + markerData.country,
		animation: a || google.maps.Animation.DROP,
		map: map,
		htmlContent: getContent(markerData),
		icon: {
			url: i || 'assets/pin.png',
			size: new google.maps.Size(32, 32),
			scaledSize: new google.maps.Size(32, 32)
		}
	});
	google.maps.event.addListener(m, 'click', function (e) {
		if(prevMarker != null){
			prevMarker.setAnimation(null);
		}
		this.setAnimation(google.maps.Animation.BOUNCE);
		prevMarker = this;
		infowindow.setContent(this.htmlContent);
		infowindow.open(map, this);
		map.panTo(this.getPosition());
	});
	return m;
}// Use the DOM setInterval() function to change the offset of the symbol
// at fixed intervals.
function animateCircle(line) {
	var count = 0;
	line.interval = window.setInterval(function () {
		count = (count + 1) % 200;
		var icons = line.get('icons');
		icons[0].offset = (count / 2);/*
		if (icons[0].offset > 99) {
			clearInterval(line.interval);
			line.set('icons', []);
			return;
		}*/
		icons[0].offset += '%';
		line.set('icons', icons);
	}, 50);
}
function createLine(start, end) {
	return new google.maps.Polyline({
		path: [
			new google.maps.LatLng(end.latitude, end.longitude),
			new google.maps.LatLng(start.latitude, start.longitude)
		],
		strokeColor: 'rgba(123, 17, 19, .35)',
		icons: [{
			icon: {
				path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
				scale: 2,
				strokeColor: 'rgb(216, 54, 2)'
			},
			offset: '100%'
		}],
		map: map
	});
}
function showData(locations) {
	clearInterval(t);
	t = setInterval(loadData, 50000);
	for (var i = 0, each; each = locations[i]; i++) {
		if (each.new) {
			each.latLng = new google.maps.LatLng(each.latitude, each.longitude);
			each.marker = createMarker(each, google.maps.Animation.DROP,each.icon);
			markersList.push(each.marker);
			each.line = createLine(dofData, each);
			animateCircle(each.line);
			delete each.new;
		}
	}
}
function dataCB(data) {
	document.getElementById('loader').style.display = 'none';
	data = parser(data);
	for (var i = 0, each; each = data.documentElement.getElementsByTagName('WorldMap')[i]; i++) {
		if (each.getElementsByTagName('ipAddess')[0].innerHTML != "DOF") {
			if (positions[each.getElementsByTagName('latitude')[0].innerHTML] == undefined ||
				positions[each.getElementsByTagName('latitude')[0].innerHTML] != each.getElementsByTagName('longitude')[0].innerHTML) {
				positions[each.getElementsByTagName('latitude')[0].innerHTML] = each.getElementsByTagName('longitude')[0].innerHTML;
				this.push({
					userName: each.getElementsByTagName('UserName')[0].innerHTML,
					ipAddress: each.getElementsByTagName('ipAddess')[0].innerHTML,
					creationTime: each.getElementsByTagName('creationTime')[0].innerHTML,
					attackCount: each.getElementsByTagName('attackCount')[0].innerHTML,
					latitude: each.getElementsByTagName('latitude')[0].innerHTML,
					longitude: each.getElementsByTagName('longitude')[0].innerHTML,
					city: each.getElementsByTagName('city')[0].innerHTML,
					country: each.getElementsByTagName('country')[0].innerHTML,
					new: true,
					icon : this == vpnData ? (each.getElementsByTagName('ImagePath')[0].innerHTML == 'Images/vpn.png' ? 'assets/green1.png' : 'assets/red1.png') : 'assets/blue.png'
				});
			}
		}
	}
	showData(this);
}

function ajaxCB(data){
	document.getElementById('loader').style.display = 'none';
    if(data.status == 200 && data.data.length > 0 ){
        for(var i = 0 ;i < data.data.length ; i++){
			if ( data.data[i].i_paddress != "DOF" || (data.data[i].latitude == dofData.latitude && data.data[i].longitude == dofData.longitude )) {
				if (positions[data.data[i].latitude] == undefined ||
					positions[data.data[i].latitude] != data.data[i].longitude) {
					positions[data.data[i].latitude] = data.data[i].longitude;
					vpnData.push({
						userName: data.data[i].user_name,
						ipAddress: data.data[i].i_paddress,
						creationTime: data.data[i].creation_time,
						attackCount: data.data[i].count,
						latitude: data.data[i].latitude,
						longitude: data.data[i].longitude,
						city: data.data[i].city_name,
						country: data.data[i].country_name,
						new: true,
						icon :(data.data[i].status == 'fail' ? 'assets/red1.png' : 'assets/green1.png')
					});
				}
			}
        }
	}
	showData(vpnData);
}

function loadData() {
	document.getElementById('loader').style.display = 'block';
    if(currentScreen == 'VPN'){
        $.ajax({
            url: 'vpnData',
            dataType: 'json',
            success: ajaxCB,
            error: function () {
            }
        });
    }else{
        $.ajax({
            url: 'XMLFiles/' + currentScreen + '.xml',
            dataType: 'text',
            success: dataCB.bind(currentScreen == 'PublicIP' ? publicData : vpnData),
            error: function () {
            }
        });
    }
}
function changeView() {
	if (this.className !== 'button active') {
		for (var i = 0; each = (currentScreen == 'PublicIP' ? publicData : vpnData)[i]; i++) {
			each.marker.setMap(null);
			each.line.setMap(null);
		}
		currentScreen = this.id == 'public' ? 'PublicIP' : 'VPN';
		clearInterval(t);
		positions = {};
		publicData.length = vpnData.length = 0;
		loadData();
		document.getElementById(this.id != 'public' ? 'public' : 'vpn').className = 'button';
		this.className = 'button active';
	}
}
function init() {
	dofData.latLng = new google.maps.LatLng(dofData.latitude, dofData.longitude);
	mapOptions = {
		zoom: 8,
		center: dofData.latLng,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE],
			position: google.maps.ControlPosition.BOTTOM_LEFT
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: true,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.BOTTOM_RIGHT
		},
		enableCloseButton: false,
		panControl: true,
		panControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		},
		zoomControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		}
	};
	map = new google.maps.Map(document.getElementById('mapCanvas'),
		mapOptions);
	infowindow = new google.maps.InfoWindow({
		content: ''
	});
	marker = createMarker(dofData, google.maps.Animation.BOUNCE, 'assets/dof.png');
	google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
		//alert('this part runs when the mapobject is created and rendered');
		document.getElementById('loader').style.display = 'none';
		marker.setAnimation(null);
		t = setInterval(loadData, 50000);
		loadData();
	});
	document.getElementById('vpn').addEventListener('click', changeView);
	document.getElementById('public').addEventListener('click', changeView);
}
function onLoad() {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
		'&signed_in=false&callback=init';
	document.getElementsByTagName('head')[0].appendChild(script);
}
window.addEventListener('load', onLoad);