/**
 * Created by Suri on 12/15/2014.
 */


function loadXmlfiles(xmls,callBack){
	var xhr;
	var count=0

	doAjax();
	function doAjax() {
		$.ajax({
			url: xmls[count] + ".xml",
			dataType: "html",
			success: function (data) {
				console.log(data.length, this.url);
				count = count + 1;
				var rex = /(\<(\/)?[A-Za-z0-9]+\>)(\s)+/gi;
				data = data.replace(rex, "$1");
				data = $.parseXML(data);
				globeldata.xmlResultData.push(data);
				if (count == xmls.length) {
					callBack();
				} else {
					doAjax();
				}
			}, error: function () {
				console.log(this);
			}
		});
	}

}

