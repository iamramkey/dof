
function loginSubmit(e) {
    e.preventDefault();
    if ($('#login-username').val().trim().length == 0) {
        $('#login-alert').attr('class', 'alert alert-warning col-sm-12').text('Please enter Username').stop().fadeIn();
        $('#login-username').focus();
    } else if ($('#login-password').val().trim().length == 0) {
        $('#login-alert').attr('class', 'alert alert-warning col-sm-12').text('Please enter Password').stop().fadeIn();
        $('#login-password').focus();
    } else {
        $.ajax({
            url : 'login',
            type : 'POST',
            dataType : 'json',
            data : {
                username : $('#login-username').val().trim(),
                password : $('#login-password').val().trim()
            },
            success: function(data){
                data = data instanceof Object ? data : {};
                if(data.success){
                    $('#login-alert').attr('class', 'alert alert-success col-sm-12').text('Successfully logged in').stop().fadeIn();                        setTimeout(function () {
                        window.location.href = 'overview'
                    }, 1000);
                    document.getElementById('loginform').reset();
                }else{
                    $('#login-alert').attr('class', 'alert alert-danger col-sm-12').text(data.error).stop().fadeIn();
                }
            },
            error : function(){
                $('#login-alert').attr('class', 'alert alert-danger col-sm-12').text('Network error').stop().fadeIn();
            }
        });
    }
    return false;
}

function onWindowLoad(){
    document.getElementById('loginform').addEventListener('submit',loginSubmit);
}

window.addEventListener('load',onWindowLoad);