// JavaScript Document
var data = [{
		title: 'Net Craft',
		url: 'http://news.netcraft.com/feed/',
		image : '1.jpg'
	}, {
		title: 'Latest articles from SC Magazine News',
		url: 'http://feeds.feedburner.com/SCMagazineNews?format=xml',
		image : '2.jpg'
	}, {
		title: 'Gartner Blog Network gbn-feed - Gartner Blog Network',
		url: 'http://blogs.gartner.com/gbn-feed/',
		image : '3.jpg'
	}, {
		title: 'SecurityWeek RSS Feed',
		url: 'http://feeds.feedburner.com/Securityweek',
		image : '4.jpg'
	}, {
		title: 'SpeedGuide.net Broadband Community - 46,68,70,71,102',
		url: 'http://forums.speedguide.net/external.php?type=rss2&forumids=46,68,70,71,102',
		image : '5.jpg'
	}, {
		title: 'TheHackersNews',
		url: 'http://feeds.feedburner.com/TheHackersNews?format=xml',
		image : '6.jpg'
	}, {
		title: 'aeCERT - Infosec Notices',
		url: 'http://aecert.ae/en/section/resource-center/infosec-notices/feed',
		image : '7.jpg'
	}, {
		title: 'Vulnerabilities RSS Feed - Symantec Corp.',
		url: 'http://www.symantec.com/xml/rss/listings.jsp?lid=advisories',
		image : '8.jpg'
	}, {
		title: 'aeCERT - Advisory',
		url: 'http://aecert.ae/en/section/resource-center/advisory/feed',
		image : '9.jpg'
	}, {
		title: 'IASE RSS Feed',
		url: 'http://iase.disa.mil/rss/rss_feeds/rss_iase.xml',
		image : '10.jpg'
	}, {
		title: 'National Vulnerability Database',
		url: 'https://nvd.nist.gov/download/nvd-rss.xml',
		image : '11.jpg'
	}, {
		title: 'aeCERT - Statistics',
		url: 'http://aecert.ae/en/section/resource-center/statistics/feed',
		image : '4170643-matrix-binary.jpg'
	}],
	copy = data.slice(),
	json = {};



function onItemClick() {
	if (this.className.search('active') == -1) {
		$('.info.active,.item.active').removeClass('active');
		$(this).addClass('active').next().addClass('active');
		//$(this).parent().animate({scrollTop : $(this).offset().top - 75});
		clearInterval(t);
		if(document.getElementById('stop').className == 'pause'){
			t = setInterval(startAnim,8000);
		}
	} else {
		$(this).removeClass('active').next().removeClass('active');
	}
}

function loadData() {
	if (copy.length > 0) {
		$.ajax({
			url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(copy[0].url),
			dataType: 'json',
			success: function(data) {
				if (data.responseData.feed) {
					if (data.responseData.feed.entries instanceof Array) {
						if (data.responseData.feed.entries.length > 0) {
							$.each(data.responseData.feed.entries, function(i, e) {
								if (!json[copy[0].title]) {
									json[copy[0].title] = [];
									json[copy[0].title].image = copy[0].image;
								}
								json[copy[0].title].push({
									title: e.title,
									publishedDate: e.publishedDate || 'Not Specified',
									author: e.author || 'Not Specified',
									description: e.content || e.contentSnippet || 'No Description'
								});
							});
						} else {
							json[copy[0].title] = {};
							json[copy[0].title].image = copy[0].image;
						}
					} else {
						json[copy[0].title] = {};
						json[copy[0].title].image = copy[0].image;
					}
				} else {
					json[copy[0].title] = {};
					json[copy[0].title].image = copy[0].image;
				}
				copy.splice(0, 1);
				loadData();
			},
			error: function() {
				json[copy[0].title] = {};
				json[copy[0].title].image = copy[0].image;
				copy.splice(0, 1);
				loadData();
			}
		});
	} else {
		onLoad();
	}
}
var count = 0;
/*
function movenext() {
	$(cscreen).eq(count).addClass("inactive");
	count = count + 1;
	document.title = count;
	if (count == cscreen.length) {
		count = 1;
	}
	$(cscreen).eq(count-1).addClass("active");
	$('#bottom .button').each(function(element, index) {
		$('#bottom .button').removeClass("active");
		$(element).addClass("active");
	})
}

function moveprev() {
	console.log(count);
	$(cscreen).eq(count).addClass("active");
	count = count - 1;
	document.title = count;
	if (count == 0) {
		count = cscreen.length;
	}
	console.log(count);
	$(cscreen).eq(count-1).addClass("inactive");
	$('#bottom .button').each(function(element, index) {
		$('#bottom .button').removeClass("active");
		$(element).addClass("active");
	})
}*/
function changeScreen(){
	clearInterval(t);
	var k = this.getAttribute('id') === 'next' ? true : false;
	if(k){
		$(cscreen).eq(count).stop().animate({left : "-100%"});
		count++;
		if(count > (cscreen.length - 1)){
			count = 0;
		}	
		$(cscreen).eq(count).css({
			left : "100%"
		}).stop().animate({left : 0});
	}else{
		$(cscreen).eq(count).stop().animate({left : "100%"});
		count--;
		if(count < 0){		
			count = cscreen.length - 1;
		}
		$(cscreen).eq(count).css({
			left : "-100%"
		}).stop().animate({left : 0});
	}
	$('.button.active').removeClass('active');
	$('.button').eq(count).addClass('active');
	if(document.getElementById('stop').className == 'pause'){
		t = setInterval(startAnim,8000);
	}
}
function buttonClick(){
	if(this.className.search('active') == -1){
		clearInterval(t);
		var index = $(this).index() - 1;
		if(($(this).index() - 1) < count){
			$(cscreen).eq(count).stop().animate({left : "100%"});
			$(cscreen).eq(index).css({
				left : "-100%"
			}).stop().animate({left : 0});
		}else{
			$(cscreen).eq(count).stop().animate({left : "-100%"});
			$(cscreen).eq(index).css({
				left : "100%"
			}).stop().animate({left : 0});
		}
		count = index;
		$('.button.active').removeClass('active');
		$('.button').eq(count).addClass('active');
		if(document.getElementById('stop').className == 'pause'){
			t = setInterval(startAnim,8000);
		}
	}
}
function startAnim(){
	changeScreen.call(document.getElementById('next'));
}
function stopAnim(){
	if(this.className == 'play'){
		t = setInterval(startAnim,8000);
		this.className = 'pause';
	}else{
		clearInterval(t);
		this.className = 'play';
	}
}
function onLoad() {
	for (var i in json) {
		var screen = document.createElement('div');
		screen.className = 'screenS';
		var content = document.createElement('div');
		content.className = 'content';
		screen.style.backgroundImage = 'url(assets/'+ json[i].image +')';
		var title = document.createElement('div');
		title.className = 'title';
		title.innerHTML = i;
		var button = document.createElement('li');
		button.addEventListener('click',buttonClick);
		button.className = 'button';
		content.appendChild(title);
		if(json[i].length > 0){
			for (var j = 0; each = json[i][j]; j++) {
				var item = document.createElement('div');
				item.className = 'item';
				var info = document.createElement('div');
				info.className = 'info';
				var date = document.createElement('span');
				date.className = 'date';
				date.innerHTML = each.publishedDate;
				var author = document.createElement('span');
				author.className = 'author';
				author.innerHTML = each.author;
				var desc = document.createElement('div');
				desc.className = 'desc';
				desc.innerHTML = each.description;
				item.innerHTML = each.title;
				item.addEventListener('click', onItemClick);
				info.appendChild(date);
				info.appendChild(author);
				info.appendChild(desc);
				content.appendChild(item);
				content.appendChild(info);
			}
		}else{
			var nodata = document.createElement('div');
			nodata.className = 'nodata';
			content.appendChild(nodata);
		}
		screen.appendChild(content);
		document.getElementById('bottom').appendChild(button);
		document.getElementById('screensDiv').appendChild(screen);
	}
	$("#loaderDiv").hide();
	$(".screen").eq(0).css("left",0);
	$(".button").eq(0).addClass("active");
	cscreen = document.getElementsByClassName("screen");
	document.getElementById("next").addEventListener("click", changeScreen);
	document.getElementById("prev").addEventListener("click", changeScreen);
	document.getElementById('stop').addEventListener('click',stopAnim);
	t = setInterval(startAnim,8000);
}

window.addEventListener('load', loadData);