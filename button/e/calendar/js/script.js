(function () {
    var editRow = null;

    function isNumberKey(evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    function preloader(visible) {
        if (visible) {
            $('#preloader').removeClass('inactive').fadeIn();
        } else {
            $('#preloader').fadeOut(function () {
                $(this).addClass('inactive')
            });
        }
    }

    function loginSubmit() {
        if ($('#login-username').val().toLowerCase().trim() == 'admin' && $('#login-password').val().toLowerCase().trim() == 'admin') {
            $('#login-alert').attr('class', 'alert alert-success col-sm-12').text('Successfully logged in').stop().fadeIn();
            setTimeout(function () {
                $('#login,#login-alert').fadeOut();
                $('#content,#logoutButton').fadeIn();
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
        $('#login').fadeIn();
        $('#content,#logoutButton').fadeOut();
    }

    function radioCheck() {
        editRow = this.parentNode.parentNode;
        $('#user_data input:checked').not(this).prop('checked', false);
    }

    angular.module("data_filter", []).controller("appController", ["$scope", "$http", '$sce', function appController($scope, $http, $sce) {
        $scope.getdata = active;
        $scope.list = active;
        $scope.all = db;
        $scope.statuses = statuses;
        $scope.locations = locations;
        $scope.search = '';
        $scope.edit = false;
        $scope.add = false;
        $scope.date = false;
        $scope.cancelDateSearch = function () {
            if (editRow) {
                $(editRow).find('input').prop('checked', false);
                editRow = null;
            }
            $scope.edit = false;
            $scope.add = false;
            $scope.date = false;
            $scope.dateFrom = '';
            $scope.dateTo = '';
            $scope.getdata = $scope.list;
        };
        $scope.dateSearch = function () {
            if (editRow) {
                $(editRow).find('input').prop('checked', false);
                editRow = null;
            }
            $scope.edit = false;
            $scope.add = false;
            $scope.date = true;
            var arr = [],
                from = new Date($scope.dateFrom),
                to = new Date($scope.dateTo);
            from.setHours(23, 59, 59);
            to.setHours(23, 59, 59);
            for (var i = 0; i < $scope.all.length; i++) {
                if ($scope.all[i]) {
                    if (new Date($scope.all[i].created_date)) {
                        if (from.getTime() <= new Date($scope.all[i].created_date).getTime() && new Date($scope.all[i].created_date).getTime() <= to.getTime()) {
                            arr.push($scope.all[i]);
                        }
                    }
                }
            }
            $scope.getdata = arr;
        };
        $scope.createdDate = new Date().toLocaleDateString();
        $scope.showAdd = function () {
            if (editRow) {
                $(editRow).find('input').prop('checked', false);
                editRow = null;
            }
            $scope.edit = false;
            $scope.add = true;
        }
        $scope.format = function (value) {
            if (value) {
                if ($scope.search.trim().length > 0) {
                    var re = new RegExp($scope.search.trim(), 'i');
                    return $sce.trustAsHtml(value.toString().replace(re, '<strong>$&</strong>'));
                }
                return $sce.trustAsHtml(value.toString());
            }
            return $sce.trustAsHtml(value);
        };
        $scope.checkDisabled = function (key, value) {
            if (key == 'created_date') {
                return true;
            }
            return false;
        }
        $scope.showEdit = function () {
            if (editRow) {
                editRow.style.display = 'none';
                $(editRow).before($('#editRow'));
                $scope.edit = true;
                var inputs = $('#editRow td');
                $(editRow).find('td').each(function (i, e) {
                    inputs[i].firstElementChild ? inputs[i].firstElementChild.value = e.textContent.trim() : '';
                });
            }
        }
        $scope.cancelEdit = function () {
            $scope.edit = false;
            $scope.getdata = [];
            editRow = null;
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.getdata = $scope.list;
                });
            }, 0);
        }
        $scope.deleteRow = function () {
            if (editRow != null && $scope.add == false && $scope.edit == false && $scope.date == false) {
                $('#message').attr('class', 'waiting').text('Deleting ticket, Please wait').stop().fadeIn();
                preloader(true);
                $.ajax({
                    url: 'delete',
                    type: 'post',
                    data: {
                        siNo: $(editRow).find('td').eq(1).text().trim()
                    },
                    dataType: 'json',
                    cache:false,
                    success: function (data) {
                        data = data instanceof Object ? data : {};
                        switch (data.status) {
                            case 200:
                                $scope.$apply(function () {
                                    $scope.list.splice($(editRow).index() - 1, 1);
                                    $scope.getdata = $scope.list;
                                });
                                $('#message').attr('class', 'success').text(data.message).stop().fadeIn();
                                editRow = null;
                                break;
                            default:
                                $('#message').attr('class', 'error').text(data.message).stop().fadeIn();
                                break;

                        }
                        preloader(false);
                    }, error: function () {
                        $('#message').attr('class', 'error').text('Unable to create ticket, Please try again').stop().fadeIn();
                        preloader(false);
                    }
                });
            }
        }
        function editRows() {
            $('#message').attr('class', '').stop().fadeOut();
            var formData = $('#editForm').serializeArray();
            var data = {};
            for (var i = 0; i < formData.length; i++) {
                switch (formData[i].name) {
                    case 'siNo':
                        if (formData[i].value.trim().length != 0) {
                            if (isNaN(Number(formData[i].value))) {
                                $('#message').attr('class', 'error').text('Entered Serial is not a number').stop().fadeIn();
                                $('#' + formData[i].name + 'e').focus();
                                return;
                            }
                        } else {
                            $('#message').attr('class', 'error').text('Please enter Serial number').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                        break;
                    case 'caseNo':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter case number').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                        break;
                    case 'title':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Title').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                    case 'attack':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Attack type').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                        break;
                    case 'priority':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Priority').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                        break;
                    case 'engineer':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Engineer name').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                        break;
                    case 'pending':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Pending with').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                        break;
                    case 'comments':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Comments').stop().fadeIn();
                            $('#' + formData[i].name + 'e').focus();
                            return;
                        }
                        break;
                }
                data[formData[i].name] = formData[i].value.trim();
            }
            $('#message').attr('class', 'waiting').text('Updating ticket, Please wait').stop().fadeIn();
            preloader(true);
            $.ajax({
                url: 'edit',
                type: 'post',
                data: data,
                cache:false,
                dataType: 'json',
                success: function (serverData) {
                    serverData = serverData instanceof Object ? serverData : {};
                    switch (serverData.status) {
                        case 200:
                            $scope.$apply(function () {
                                $scope.edit = false;
                                if(data.statuses == 'Closed'){
                                    $scope.list.splice($(editRow).index() - 2, 1);
                                    $scope.all.splice($(editRow).index() - 2, 1, serverData.data);
                                }else{
                                    $scope.list.splice($(editRow).index() - 2, 1, serverData.data);
                                    $scope.all.splice($(editRow).index() - 2, 1, serverData.data);
                                }
                                $scope.getdata = $scope.list;
                            });
                            $('#message').attr('class', 'success').text(serverData.message).stop().fadeIn();
                            $('#editForm').trigger('reset');
                            break;
                        default:
                            $('#message').attr('class', 'error').text(serverData.message).stop().fadeIn();
                            break;

                    }
                    preloader(false);
                }, error: function () {
                    $('#message').attr('class', 'error').text('Unable to create ticket, Please try again').stop().fadeIn();
                    preloader(false);
                }
            });
        }

        function addRow() {
            $('#message').attr('class', '').stop().fadeOut();
            var formData = $('#createForm').serializeArray();
            var data = {};
            for (var i = 0; i < formData.length; i++) {
                switch (formData[i].name) {
                    case 'siNo':
                        if (formData[i].value.trim().length != 0) {
                            if (isNaN(Number(formData[i].value))) {
                                $('#message').attr('class', 'error').text('Entered Serial is not a number').stop().fadeIn();
                                $('#' + formData[i].name).focus();
                                return;
                            }
                        } else {
                            $('#message').attr('class', 'error').text('Please enter Serial number').stop().fadeIn();
                            $('#' + formData[i].name).focus();
                            return;
                        }
                        break;
                    case 'caseNo':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter case number').stop().fadeIn();
                            $('#' + formData[i].name).focus();
                            return;
                        }
                        break;
                    case 'title':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Title').stop().fadeIn();
                            $('#' + formData[i].name).focus();
                            return;
                        }
                    case 'attack':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Attack type').stop().fadeIn();
                            return;
                        }
                        break;
                    case 'priority':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Priority').stop().fadeIn();
                            return;
                        }
                        break;
                    case 'engineer':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Engineer name').stop().fadeIn();
                            $('#' + formData[i].name).focus();
                            return;
                        }
                        break;
                    case 'pending':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Pending with').stop().fadeIn();
                            $('#' + formData[i].name).focus();
                            return;
                        }
                        break;
                    case 'comments':
                        if (formData[i].value.trim().length == 0) {
                            $('#message').attr('class', 'error').text('Please enter Comments').stop().fadeIn();
                            $('#' + formData[i].name).focus();
                            return;
                        }
                        break;
                }
                data[formData[i].name] = formData[i].value.trim();
            }
            $('#message').attr('class', 'waiting').text('Creating ticket, Please wait').stop().fadeIn();
            preloader(true);
            $.ajax({
                url: 'add',
                type: 'post',
                data: data,
                cache:false,
                dataType: 'json',
                success: function (serverData) {
                    serverData = serverData instanceof Object ? serverData : {};
                    switch (serverData.status) {
                        case 200:
                            $scope.$apply(function () {
                                $scope.add = false;
                                if(data.statuses != 'Closed'){
                                    $scope.list.unshift(serverData.data);
                                    $scope.all.unshift(serverData.data);
                                }
                                $scope.getdata = $scope.list;
                            });
                            $('#message').attr('class', 'success').text(serverData.message).stop().fadeIn();
                            $('#createForm').trigger('reset');
                            break;
                        default:
                            $('#message').attr('class', 'error').text(serverData.message).stop().fadeIn();
                            break;

                    }
                    preloader(false);
                }, error: function () {
                    $('#message').attr('class', 'error').text('Unable to create ticket, Please try again').stop().fadeIn();
                    preloader(false);
                }
            });
        }
        $('.number').on('keypress', isNumberKey);
        $('#date_timepicker_start').datetimepicker({
            minDate: '2014/01/01',
            maxDate: 0,
            timepicker: false,
            format: 'Y/m/d',
            allowBlank: false,
            onSelectDate: function (ct, $ele) {
                $scope.$apply(function () {
                    $scope.date = false;
                });
                $ele[0].dater = ct;
                if ($ele[0].getAttribute('id') == 'date_timepicker_start') {
                    $('#date_timepicker_end').val('').datetimepicker({
                        minDate: ct.dateFormat('Y/m/d'),
                        maxDate: 0,
                        timepicker: false,
                        format: 'Y/m/d',
                        allowBlank: false,
                        onSelectDate: function (ct, $ele) {
                            $ele.datetimepicker('hide');
                            $scope.$apply(function () {
                                $scope.date = false;
                            });
                        }
                    });
                }
                $ele.datetimepicker('hide');
            }
        });
        function closeMessage(){
            $(this).stop().fadeOut();
        }
        document.getElementById('dataScript').parentNode.removeChild(document.getElementById('dataScript'));
        document.getElementById('addRow').addEventListener('click', addRow);
        document.getElementById('editRowBtn').addEventListener('click', editRows);
        document.getElementById('loginform').addEventListener('submit', loginSubmit);
        document.getElementById('logoutButton').addEventListener('click', logoutUser);
        $('#user_data').on('click', '.select', radioCheck);
        document
            .getElementById('message').addEventListener('click',closeMessage);
        preloader(false);
    }]);
})();