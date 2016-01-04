/**
 * Created by computer on 10/28/2015.
 */
function menuClick(){
    $('#menu,#modal').fadeIn(100,function () {
        $('#menus').css('left','-250px').animate({
            left : '0'
        });
    });
}
function modalClick(){
    $('#menus').animate({
        left : '-250px'
    },function(){
        $('#modal').fadeOut(function(){
            $('#menu').hide();
        });
    });
}
function onLoad(){
    document.getElementById('menuIcon').addEventListener('click', menuClick);
    document.getElementById('modal').addEventListener('click', modalClick);
}
window.addEventListener('load', onLoad);