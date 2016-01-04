var interval;
function menuClick(e){
    if(!$(this).hasClass('active')){
        if ($('.menu-toggle').data('active') == 'yes') {
            $('#menu-wrap').stop(true, true).addClass('active');
            $('.menu-toggle').data('active', 'no');
            $('.menu-toggle').css({
                'transform': 'rotate(0deg)'
            });
        } else {
            $('#menu-wrap').stop(true, true).removeClass('active');
            $('.menu-toggle').data('active', 'yes');
            $('.menu-toggle').css({
                'transform': 'rotate(180deg)'
            });
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
    }
}
function startAnimation(k){
    if(k){
        interval = setTimeout(function(){
            var a = $('a[href="' + window.location.href.split('/')[window.location.href.split('/').length - 1] + '"]').next();
            if(a.attr('href') == 'video'){
                a = a.next();
            }else if(a.attr('id') == 'logout'){
                a = a.parent().find('a').first();
            }
            window.location.href = a.attr('href');
        },10000);        
    }else{
        clearTimeout(interval);
    }
    
}
function anim(e){
    e.stopImmediatePropagation();
    e.stopPropagation();
    if($(this).hasClass('pause')){
        window.sessionStorage.setItem('animation','paused');
        this.className = 'play';
        startAnimation(false);
    }else{
        window.sessionStorage.setItem('animation','playing');
        this.className = 'pause';
        startAnimation(true);
    }
}
function onLogout(){
    $.ajax({
        url : 'logout',
        type : 'POST',
        dataType : 'json',
        success: function(data){
            data = data instanceof Object ? data : {};
            window.location.href = 'login';
        },
        error : function(){
            window.location.href = 'login';
        }
    });
}
function onWindowLoad(){
    $('#menu-wrap').on('click',menuClick);
    $('.menu-toggle').on('click',menuClick);
    $('#animation').on('click',anim);
    $('.menu-toggle').data('active', 'yes').css({
        'transform': 'rotate(180deg)'
    });
    $('#logout').on('click',onLogout);
    if(window.sessionStorage.getItem('animation') == null){
        window.sessionStorage.setItem('animation','playing');
        startAnimation(true);
    }else{
        startAnimation(window.sessionStorage.getItem('animation') == 'playing' ? true : false);
        $('#animation').attr('class',window.sessionStorage.getItem('animation') == 'playing' ? 'pause' : 'play');
    }
}
window.addEventListener('load',onWindowLoad);