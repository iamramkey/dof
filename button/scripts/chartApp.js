/**
 * Created by Suri on 1/21/2015.
 */
window.addEventListener("DOMContentLoaded", onLoad);
window.addEventListener('resize', resizeHandler, false);
var globeldata = {}
globeldata.xmls = ["XMLFiles/HPSMTicketsMonthNew"];
globeldata.xmlResultData = [];
globeldata.dailyChartData = [];
globeldata.chart;
var opened = "";
var defaultAnim = true;

function Id(k) {
    return document.getElementById(k)
}

function elementsByClass(k) {
    return document.getElementsByClassName(k)
}

String.prototype.splitFun = function (splitFun) {
    /*
    	return new Date(this).toLocaleDateString('de-DE', {
    		year: 'numeric',
    		month: '2-digit',
    		day: '2-digit'
    	}).replace(/\./g, '-');*/
    var d = new Date(this);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}

function onLoad() {
    loadXmlfiles(globeldata.xmls, XmlLoaded);
    Id("closeRackOne").addEventListener("click", function () {
        if (window.innerWidth < 850) {
            $("#popupDiv").fadeOut();
            document.getElementById('tableDatazoom').appendChild(Id("mobTable"));
            /*$(".tableParentMobile").css({
                height: 375
            })
            $("#tablebodydataMobile").css({
                height: 350
            })*/
        } else {
            $("#popupDiv").fadeOut();
            document.getElementById('tableDatazoom').appendChild(Id("deskTable"));
            /*$(".tableParent").css({
                width: "98%",
                height: 375
            })
            $("#tablebodydata").css({
                height: 350
            })*/
        }
    })
    $(".mainButt").on("click", function () {
        if (!$(this).hasClass("active")) {
            $('.mainButt').removeClass('active');
            $(this).addClass('active');
            if ($(this).html() == "OverView") {
                defaultAnim = true;
                XmlLoaded();
            } else {
                defaultAnim = false;
                XmlLoaded();
            }
        }
    });
}

function XmlLoaded() {
    var tabledata = [];
    globeldata.dailyChartData = [
		['Daily', 'count', {
            type: 'string',
            role: 'annotation'
        }]
	];
    globeldata.pending = [
		['Team', 'count']
	];
    globeldata.location = [
		['location', 'count']
	];
    globeldata.typesOfAttack = [
	]
    var root = globeldata.xmlResultData[0].getElementsByTagName("DocumentElement")[0].childNodes;
    if (!defaultAnim) {
        var root = globeldata.xmlResultData[0].getElementsByTagName("DocumentElement")[0];
        var arr = [];
        for (var i = 0; i < root.childNodes.length; i++) {
            if (root.childNodes[i].getElementsByTagName("Status")[0].firstChild.nodeValue == 'Follow up') {
                arr.push(root.childNodes[i]);

            }
        }
        root = arr;
    }
    console.log(root);
    for (var i = 0; i < root.length; i++) {
        var matched = false;
        var matchedTOA = false;
        var matchedPen = false;
        var matchedLoc = false;
        var date = root[i].getElementsByTagName("Date")[0].firstChild.nodeValue.splitFun();
        var typesOfAttack = root[i].getElementsByTagName("Types_of_Attack")[0].firstChild.nodeValue;
        var pendingWith = root[i].getElementsByTagName("Pending_with")[0].firstChild.nodeValue;
        var location = root[i].getElementsByTagName("location")[0].firstChild.nodeValue;
        var j = 0
        for (; j < globeldata.dailyChartData.length; j++) {
            if (globeldata.dailyChartData[j][0] == date) {
                matched = true;
                break;
            }
        }
        if (matched) {
            globeldata.dailyChartData[j][1] = globeldata.dailyChartData[j][1] + 1;
            globeldata.dailyChartData[j][2] = globeldata.dailyChartData[j][1];
        } else {
            globeldata.dailyChartData.push([date, 1, 1])
        }
        tabledata.push(root[i]);
        var k = 0
        for (; k < globeldata.typesOfAttack.length; k++) {
            if (globeldata.typesOfAttack[k][0] == typesOfAttack) {
                matchedTOA = true;
                break;
            }
        }
        if (matchedTOA) {
            globeldata.typesOfAttack[k][1] = globeldata.typesOfAttack[k][1] + 1;

        } else {
            globeldata.typesOfAttack.push([typesOfAttack, 1])
        }
        var l = 0
        for (; l < globeldata.pending.length; l++) {
            if (globeldata.pending[l][0] == pendingWith) {
                matchedPen = true;
                break;
            }
        }
        if (matchedPen) {
            globeldata.pending[l][1] = globeldata.pending[l][1] + 1;
        } else {
            globeldata.pending.push([pendingWith, 1])
        }
        var m = 0
        for (; m < globeldata.location.length; m++) {
            if (globeldata.location[m][0] == location) {
                matchedLoc = true;
                break;
            }
        }
        if (matchedLoc) {
            globeldata.location[m][1] = globeldata.location[m][1] + 1;

        } else {
            globeldata.location.push([location, 1])
        }
    }
    Id("ticketsCountCh").innerHTML = root.length;
    console.log(globeldata.pending)
    drawChart();
    drawTOA();
    drawLocationChart();
    drawPieChart();
    prpareTableHead(tabledata);
    prepareTableData(tabledata);
}
function drawLocationChart() {
    var data = google.visualization.arrayToDataTable(globeldata.location);
    var options = {
        height : $('.lineChart').height() - 40 - ($('.lineChart').height()*.10),
        title: 'Severity wise Chart',
        titlePosition: 'none',
        is3D: true,
        legend: {
            position: 'right'
        },
        chartArea: {
            left: "7%",
            top: 20,
            width: "90%",
            height: "70%"
        },
        hAxis: {
            textStyle: {
                color: '#FFF'
            }
        },
        vAxis: {
            textStyle: {
                color: '#FFF'
            }
        },
        backgroundColor: '#171717',
        legendTextStyle: {
            color: '#fff'
        },
        pieSliceText: 'value'

    };
    var chart = new google.visualization.PieChart(document.getElementById('loactionChart'));
    chart.draw(data, options);
    Id("chartPlace").innerHTML = "";
    Id("loactionZoom").addEventListener("click", function () {
        delete options.height;
        $("#popupDiv").fadeIn();
        var zoomchart = new google.visualization.PieChart(document.getElementById('chartPlace'));
        zoomchart.draw(data, options);
    });
}
function drawPieChart() {
    var data = google.visualization.arrayToDataTable(globeldata.pending);
    var options = {
        height : $('.lineChart').height() - 40 - ($('.lineChart').height()*.10),
        title: 'Severity wise Chart',
        titlePosition: 'none',
        is3D: true,
        legend: {
            position: 'right'
        },
        chartArea: {
            left: "7%",
            top: 20,
            width: "90%",
            height: "70%"
        },
        hAxis: {
            textStyle: {
                color: '#FFF'
            }
        },
        vAxis: {
            textStyle: {
                color: '#FFF'
            }
        },
        backgroundColor: '#171717',
        legendTextStyle: {
            color: '#fff'
        },
        pieSliceText: 'value'

    };
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
    Id("chartPlace").innerHTML = "";
    Id("pieChartZoom").addEventListener("click", function () {
        delete options.height;
        $("#popupDiv").fadeIn();
        var zoomchart = new google.visualization.PieChart(document.getElementById('chartPlace'));
        zoomchart.draw(data, options);
    });
}
function drawTOA() {
    var barsVisualization;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    data.addColumn('number', 'Score');
    data.addRows(globeldata.typesOfAttack);
    barsVisualization = new google.visualization.ColumnChart(document.getElementById('barchart_material'));
    var options = {
        height:$('.lineChart').height() - 40 - ($('.lineChart').height()*.10),
        title: 'Vulnerability wise chart',
        titlePosition: 'none',
        legend: {
            position: 'none'
        },
        chartArea: {
            left: "7%",
            top: 20,
            width: "90%",
            height: "70%"
        },
        hAxis: {
            direction: -1,
            slantedText: true,
            slantedTextAngle: 40,
            textStyle: {
                color: '#FFF'
            }
        },
        vAxis: {
            textStyle: {
                color: '#FFF'
            },
            gridlines: {
                color: 'transparent'
            }
        },
        backgroundColor: '#171717'
    };
    barsVisualization.draw(data, options);
    Id("chartPlace").innerHTML = "";
    Id("barChartZoom").addEventListener("click", function () {
        delete options.height;
        $("#popupDiv").fadeIn();
        var zoomchart = new google.visualization.ColumnChart(document.getElementById('chartPlace'));
        zoomchart.draw(data, options);
    });
}
function drawChart() {
    var data = google.visualization.arrayToDataTable(globeldata.dailyChartData);
    var options = {
        height: $('#curve_chart').height(),
        title: 'Daily',
        titlePosition: 'none',
        fontSize: 13,
        legend: {
            position: 'none'
        },
        chartArea: {
            left: "5%",
            top: 20,
            width: "100%",
            height: "70%"
        },
        hAxis: {
            direction: -1,
            slantedText: true,
            slantedTextAngle: 40,
            textStyle: {
                color: '#FFF'
            }
        },
        vAxis: {
            textStyle: {
                color: '#FFF'
            },
            gridlines: {
                color: 'transparent'
            }
        },
        backgroundColor: '#171717',
        legendTextStyle: {
            color: ''
        }
    };
    globeldata.chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    globeldata.chart.draw(data, options);
    Id("chartPlace").innerHTML = "";
    Id("linechartDiv").addEventListener("click", function () {
        delete options.height;
        $("#popupDiv").fadeIn();
        globeldata.chart = new google.visualization.LineChart(document.getElementById('chartPlace'));
        globeldata.chart.draw(data, options);
    });
}
function ondataZoomClick() {
    if (window.innerWidth < 850) {
        $("#popupDiv").fadeIn();
        Id("chartPlace").innerHTML = "";
        document.getElementById('chartPlace').appendChild(Id("mobTable"));
        /*$(".tableParentMobile").css({
            width: "100%",
            height: $("#chartPlace").height()
        })
        $("#tablebodydataMobile").css({
            height: $("#chartPlace").height() - 26
        })*/
        opened = "mobTable";
    } else {
        $("#popupDiv").fadeIn();
        Id("chartPlace").innerHTML = "";
        document.getElementById('chartPlace').appendChild(Id("deskTable"));
       /* $(".tableParent").css({
            width: "100%",
            height: $("#chartPlace").height()
        })
        $("#tablebodydata").css({
            height: $("#chartPlace").height() - 26
        })*/
        opened = "deskTable";
    }
}
function resizeHandler() {
    if (opened == "mobTable") {
        Id('tableDatazoom').appendChild(Id("mobTable"));
        $("#popupDiv").fadeOut();
       /* $(".tableParentMobile").css({
            height: 375
        });
        $("#tablebodydataMobile").css({
            height: 350
        });*/
        opened = "";
    } else if (opened == "deskTable") {
        Id('tableDatazoom').appendChild(Id("deskTable"));
        $("#popupDiv").fadeOut();
        /*$(".tableParent").css({
            width: "95%",
            height: 375
        });
        $("#tablebodydata").css({
            height: 350
        });*/
        opened = "";
    }
    desAndMob();
    drawChart();
    drawTOA();
    drawLocationChart();
    drawPieChart();
}
function prpareTableHead(arr) {
    Id("tableheader").innerHTML = "";
    globeldata.tableHeads = [];
    for (var i = 0; i < arr[0].childNodes.length; i++) {
        if (arr[0].childNodes[i].nodeType == 1 && arr[0].childNodes[i].nodeName !== "Status") {
            var td = document.createElement("div");
            td.className = "thData";
            td.innerHTML = arr[0].childNodes[i].nodeName;
            Id("tableheader").appendChild(td)
            globeldata.tableHeads.push(arr[0].childNodes[i].nodeName);
        }
    }
    desAndMob();


}
function desAndMob() {
    if (window.innerWidth < 850) {
        $('#mobTable').css({
            zIndex: 1000,
            opacity: 1
        })
        $('#deskTable').css({
            zIndex: -1,
            opacity: 0
        })
    } else {
        $('#mobTable').css({
            zIndex: -1,
            opacity: 0
        })
        $('#deskTable').css({
            zIndex: 1000,
            opacity: 1
        })
    }
}
function prepareTableData(arr) {
    Id("tablebodydata").innerHTML = "";

    for (var i = 0; i < arr.length; i++) {
        var row = document.createElement("div");
        row.className = "divRow";
        var zoneCount = arr[i];
        for (var j = 0; j < globeldata.tableHeads.length; j++) {
            var td = document.createElement("div");
            td.className = "divData";
            try {
                td.appendChild(document.createTextNode(zoneCount.getElementsByTagName(globeldata.tableHeads[j])[0].firstChild.data))
            } catch (e) {

            }
            row.appendChild(td)
        }
        Id("tablebodydata").appendChild(row);
    }
    Id("tablebodydataMobile").innerHTML = "";
    for (var i = 0; i < arr.length; i++) {
        var row = document.createElement("div");
        row.className = "rowData";
        var zoneCount = arr[i];
        for (var j = 0; j < globeldata.tableHeads.length; j++) {

            var keyValue = document.createElement("div");
            keyValue.className = "keyValue";
            var key = document.createElement("div");
            key.innerHTML = globeldata.tableHeads[j];
            key.className = "key";
            var value = document.createElement("div");
            value.className = "value";
            try {

                value.innerHTML = zoneCount.getElementsByTagName(globeldata.tableHeads[j])[0].firstChild.data;
            } catch (e) {

            }
            keyValue.appendChild(key);
            keyValue.appendChild(value);
            row.appendChild(keyValue)
        }
        Id("tablebodydataMobile").appendChild(row);

    }
    desAndMob();
    $(".tableParentMobile").css("-webkit-overflow-scrolling", "auto");
    window.setTimeout(function () {
        $(".tableParentMobile").css("-webkit-overflow-scrolling", "touch");
    }, 100);

    Id("tableDatazoom").addEventListener("click", ondataZoomClick);

}
function is_touch_device() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}