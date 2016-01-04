/**
 * Created by computer on 10/28/2015.
 */
function menuClick(){
    $('#menu,#modal').fadeIn();
}
function modalClick(){
    $('#menu').fadeOut();
}
function onLoad(){
    document.getElementById('menuIcon').addEventListener('click', menuClick);
    document.getElementById('modal').addEventListener('click', modalClick);
}
window.addEventListener('load', onLoad);