function showMenu(){
    if(this.className.search('glyphicon-forward') != -1){
        this.className = 'glyphicon glyphicon-backward';
        $('#iconHolder ul,#showMenu').animate({
            width : '250px'
        });
    }else{
        this.className = 'glyphicon glyphicon-forward';
        $('#iconHolder ul,#showMenu').animate({
            width : '50px'
        });
    }
}



function loginSubmit() {
    if ($('#login-username').val().toLowerCase().trim() == 'admin' && $('#login-password').val().toLowerCase().trim() == 'admin') {
        $('#login-alert').attr('class', 'alert alert-success col-sm-12').text('Successfully logged in').stop().fadeIn();
        setTimeout(function () {
            window.location.href = 'overview-1/'
        }, 1000);
        document.getElementById('loginform').reset();
    } else {
        if ($('#login-username').val().trim().length == 0) {
            $('#login-alert').attr('class', 'alert alert-warning col-sm-12').text('Please enter Username').stop().fadeIn();
            $('#login-username').focus();
        } else if ($('#login-password').val().trim().length == 0) {
            $('#login-alert').attr('class', 'alert alert-warning col-sm-12').text('Please enter Password').stop().fadeIn();
            $('#login-password').focus();
        } else {
            $('#login-alert').attr('class', 'alert alert-danger col-sm-12').text('Invalid Credentials').stop().fadeIn();
            $('#login-username').focus();
        }
    }
    return false;
}

function logoutUser(){
    window.location.href = '../index.html';
}

function onLoad(){
    $('#showMenu').on('click',showMenu);
    $('#loginform').on('submit', loginSubmit);
    $('.glyphicon-off').on('click', logoutUser);
}

window.addEventListener('load',onLoad);