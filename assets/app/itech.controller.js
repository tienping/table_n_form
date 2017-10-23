(function() {
    'use strict';

    angular
        .module('itech.controller',[])
        .controller('itechCtrl', itechCtrl)
        .filter('toHourMinute', toHourMinute);

    itechCtrl.$inject = ['$scope', '$rootScope', '$state', 'userRs', 'vehicleRs', 'reportRs', 'Excel', '$timeout'];
    function itechCtrl($scope, $rootScope, $state, userRs, vehicleRs, reportRs, Excel, $timeout) {
        var itech = this;
        
        itech.init           = init;
        itech.getUserList    = getUserList;
        itech.openModal      = openModal;
        itech.toggleLanguage = toggleLanguage;
        itech.loginSubmit    = loginSubmit;
        itech.logoutSubmit   = logoutSubmit;
        itech.changeTab      = changeTab;
        itech.exportToExcel  = exportToExcel;

        itech.token           = getCookie(TOKEN_KEY);
        itech.currentLanguage = getCookie('tp-lang') || 'en';

        itech.data = {
            user: null,
            vehicle: null
        }

        itech.homeSelections  = [
            {
                label: 'Action',
                key: 'action',
                type: 'list'
            }, {
                label: 'Report',
                key: 'report',
                type: 'report'
            }
        ];
        itech.tabSelected = itech.homeSelections[0];

        itech.companies = [
            {
                label: 'AA RAMP'
            }, {
                label: 'AA ENGINEERING'
            }, {
                label: 'AAX ENGINEERING'
            }, {
                label: 'AAX RAMP'
            }, {
                label: 'ACWER'
            }, {
                label: 'AirAsia Charter'
            }, {
                label: 'MACKT_M'
            }, {
                label: 'PCA'
            }, {
                label: 'MALINDO'
            }, {
                label: 'VISION V.R.'
            }
        ]

        $rootScope.$on('$stateChangeSuccess', function() {
            if (!itech.token && $state.current.name !== 'login') {
                $state.go('login');
                itech.openModal('login-notification');
            } else {
                itech.pageTitle= $state.current.name;
                if (itech.pageTitle === 'login') {
                    itech.pageTitle = itech.token ? 'Logout' : 'Login';
                }
            }
        });

        function init() {
            var offsetValue = 50;
            initializeSmoothScroll(offsetValue);

            if (!itech.data.vehicle) {
                // vehicleRs.save({
                funCall({
                    param: 'list'
                }, function successCallback(response) {
                    itech.data.vehicle = response.vehicles;
                }, function failureCallback(response) {
                    
                }, 'vehicleRs.save');
            }
        }

        function getUserList() {
            if (!itech.data.userlist) {
                // vehicleRs.save({
                funCall({
                    param: 'list'
                }, function successCallback(response) {
                    itech.data.userlist = response.users;
                }, function failureCallback(response) {
                    
                }, 'userListRs.save');
            }
        }

        function openModal(id) {
            $('#' + id).modal('show');
        }

        function toggleLanguage(lang) {
            setCookie('tp-lang', lang, 3);
            location.reload();
        }

        function loginSubmit() {
            funCall({

            // userRs.save({
                param: 'login',
                username: 'admin',
                password: 'password'
            }, function successCallback(response) {
                setCookie(TOKEN_KEY, response.token, 3);
                itech.token = response.token;
                itech.data.user = response.user;
                window.location.href = '/';
            }, function failureCallback(response) {
                alert('Login Failed... Please consult system administrator.', response);
            }, 'userRs.save');
        }

        function logoutSubmit() {
            var tokenString = 'login-cookie-token-string';
            setCookie(TOKEN_KEY, '', 0);
            itech.token = null;
            location.reload();
        }

        function changeTab(key) {
            if (key == 'report') {
                var FromEndDate = new Date();
                
                $('#itech-datepicker').datepicker({
                    autoclose: true,
                    minViewMode: 1,
                    startDate: '06/2017',
                    format: 'mm/yyyy'
                }).on('changeDate', function(selected){
                    FromEndDate = new Date(selected.date.valueOf());
                    FromEndDate.setDate(FromEndDate.getDate(new Date(selected.date.valueOf())));
                });
            }
        }

        function exportToExcel(tableQuery, fileName) {
            var exportedExcelUrl = Excel.tableToExcel(tableQuery, fileName + '.xlsx');
            $timeout(function() {
                var link = document.createElement('a');
                link.download = fileName + '.xlsx';
                link.href = exportedExcelUrl;
                link.click();
            }, 100);
            
        }
    }

    function toHourMinute() {
        return function(input){
            var hours = parseInt(input / 60);
            var minutes = input % 60;
            
            if (hours) {
                return hours+' hr' + ' ' + minutes + ' min';
            } else {
                return minutes + ' min';
            }
        }
    }
})();

// a fuction to mock up resource calling
function funCall(params, successCallback, failureCallback, resourceKey) {
    console.log('Function call: ', { params: params, mockResponse: mockResponse });

    var mockResponse = {
        data: 'smth'
    }

    if (resourceKey == 'userRs.save') {
        mockResponse = {
            token: 'mock_token',
            user: {
                userdata: 'userdata'
            }
        }
    } else if(resourceKey == 'vehicleRs.save') {
        mockResponse = {
            vehicles: [
                {
                    name: 'vehicle 1',
                    company_id: 4,
                    last_check: {
                        distance: 11,
                        time: '119' // 1:59
                    },
                    num_of_uncheck: 1,
                    num_of_breakdown: 0,
                    last_breakdown: null
                },
                {
                    name: 'vehicle 2',
                    company_id: 1,
                    last_check: {
                        distance: 7,
                        time: '39' // 0:39
                    },
                    num_of_uncheck: 2,
                    num_of_breakdown: 3,
                    last_breakdown: "2017-09-29 12:10:17"
                }
            ]
        }
    } else if(resourceKey == 'userListRs.save') {
        mockResponse = {
            users: [
                {
                    name: 'user 1'
                },
                {
                    name: 'user 2'
                }
            ]
        }
    }
    successCallback(mockResponse);
}