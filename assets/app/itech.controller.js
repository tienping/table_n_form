(function() {
    'use strict';

    angular
        .module('itech.controller',[])
        .controller('itechCtrl', itechCtrl)
        .filter('toHourMinute', toHourMinute);

    itechCtrl.$inject = ['$scope', '$rootScope', '$state', 'userRs', 'vehicleRs', 'reportRs', 'Excel', '$timeout', '$location'];
    function itechCtrl($scope, $rootScope, $state, userRs, vehicleRs, reportRs, Excel, $timeout, $location) {
        var itech = this;
        
        itech.init           = init;
        itech.getUserList    = getUserList;
        itech.openModal      = openModal;
        itech.closeModal      = closeModal;
        itech.toggleLanguage = toggleLanguage;
        itech.loginSubmit    = loginSubmit;
        itech.logoutSubmit   = logoutSubmit;
        itech.changeTab      = changeTab;
        itech.exportToExcel  = exportToExcel;
        itech.formSubmit     = formSubmit;

        itech.token           = getCookie(TOKEN_KEY);
        itech.currentLanguage = getCookie('tp-lang') || 'en';

        itech.data = {
            user: null,
            vehicle: null
        }
        var localUserdata = getCookie("ITECHERO");
        if (localUserdata) { itech.data.user = JSON.parse(localUserdata); }

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

        itech.vehicleParts = [
            {
                label: 'Engine Oil'
            },
            {
                label: 'Tranmission Oil'
            },
            {
                label: 'Brake Oil'
            },
            {
                label: 'Steering Oil'
            },
            {
                label: 'Radiator Water'
            },
            {
                label: 'Front & Rear Light'
            },
            {
                label: 'Beacon Light'
            },
            {
                label: 'Brake Condition'
            },
            {
                label: 'Belting'
            },
            {
                label: 'Brake Light Left & Right'
            },
            {
                label: 'Hand Brake'
            },
            {
                label: 'Seat Condition'
            }
        ];

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
        ];
        itech.breakdownTypes = [
            'engine',
            'transmission gear box',
            'front axle',
            'rear axle',
            'brake',
            'radiator cooling system',
            'hydrauic system',
            'electrical system',
            'body',
            'other'
        ];

        itech.loginForm = {
            id: 'login',
            messages: [],
            title: 'Login',
            username: '',
            password: ''
        }

        itech.addVehicleForm = {
            id: 'vehicle-form',
            messages: [],
            title: 'Vehicle',
            field: {
                company: '',
                name: '',
                mab_expired: ''
            }
        };
        itech.addUserForm = {
            id: 'user-form',
            messages: [],
            title: 'User',
            field: {
                username: '',
                password: '',
                userLevel: ''
            }
        };
        itech.dailyReport = {
            id: 'daily-report-form',
            messages: [],
            title: 'Daily Report',
            field: {
                vehicleName: '',
                companyName: '',
                distance: '',
                time: '',
                checklist: {}
            }
        };
        itech.breakdownReport = {
            id: 'daily-report-form',
            messages: [],
            title: 'Daily Report',
            field: {
                vehicleName: '',
                companyName: '',
                distance: '',
                time: '',
                checklist: {}
            }
        };

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
        function closeModal(id) {
            $('#' + id).modal('hide');
        }

        function toggleLanguage(lang) {
            setCookie('tp-lang', lang, 3);
            location.reload();
        }

        function loginSubmit() {
            funCall({
            // userRs.save({
                param: 'login',
                username: itech.loginForm.username,
                password: itech.loginForm.password
            }, function successCallback(response) {
                setCookie(TOKEN_KEY, response.token, 3);
                setCookie("ITECHERO", JSON.stringify(response.user), 3);
                itech.token = response.token;
                itech.data.user = response.user;
                $location.path('/home');
                window.location.reload();
            }, function failureCallback(response) {
                alert('Login Failed... Please consult system administrator.', response);
            }, 'userRs.save');
        }

        function logoutSubmit() {
            var tokenString = 'login-cookie-token-string';
            setCookie(TOKEN_KEY, '', 0);
            setCookie("ITECHERO", '', 0);
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
        
        function formSubmit(data) {
            data.messages = [];

            var key = '';

            if (data.id == 'vehicle-form') {
                key = 'vehicle';
                if (!data.field.company_id) {
                    data.messages.push({text: 'Please chose a company.'})
                }
                if (!data.field.name) {
                    data.messages.push({text: 'Please assign a name.'})
                }
            } else if (data.id == 'user-form') {
                key = 'user';
                if (!data.field.username) {
                    data.messages.push({text: 'Please chose a username.'})
                }
                if (!data.field.userLevel) {
                    data.messages.push({text: 'Please assign user level.'})
                }
            } else {
                data.messages.push({text: 'Invalid data, please consult system administrator.'});
            }

            if (data.messages.length) { return; }

            // vehicleRs.post({
            funCall(data.field, function successCallback(response) {
                if (response.status == 'SUCCESS') {
                    itech.data.vehicle.push(response.vehicle);
                    itech.closeModal('add-' + key);
                }
            }, function failureCallback(response) {
                alert('Form submit fail...', response);
            }, key + 'Rs.create');
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
            "status": "SUCCESS",
            "user": {
                "id": 1,
                "username": "admin",
                "user_level": "3",
                "create_by": null,
                "created_at": null,
                "updated_at": null,
                "companies_list": [],
                "userlvl": {
                    "id": 3,
                    "role": "User",
                    "code": "user",
                    "created_at": null,
                    "updated_at": null
                }
            },
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlzcyI6Imh0dHA6Ly9jaGFtYTY2Ni5jb20vaXRlYy9wdWJsaWMvYXBpLzEuMC91c2VyL2xvZ2luIiwiaWF0IjoxNTA5MDY0MDc2LCJleHAiOjE1NDA2MDAwNzYsIm5iZiI6MTUwOTA2NDA3NiwianRpIjoiVGo4VWVIRExxUGxoU0NyeiJ9.QbUz__sRDHZ_CKzBYcIy141TXzinbmBWpIU21ezFNok"
        }

        if (params.username == 'admin') {
            mockResponse.user.user_level = "1";
            mockResponse.user.userlvl = {
                "id": 1,
                "role": "Manager",
                "code": "manager",
                "created_at": null,
                "updated_at": null
            };
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
                    last_breakdown: null,
                    "companies_list": {
                        "id": 4,
                        "name": "Malindo",
                        "code": "malindo",
                        "created_at": null,
                        "updated_at": null
                    },
                    "today_checkin": false,
                    "breakdown": true
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
                    last_breakdown: "2017-09-29 12:10:17",
                    "companies_list": {
                        "id": 2,
                        "name": "Malaysia AirLine",
                        "code": "malaysia_airLine",
                        "created_at": null,
                        "updated_at": null
                    },
                    "today_checkin": true,
                    "breakdown": false
                }
            ]
        }
    } else if(resourceKey == 'vehicleRs.create') {
        mockResponse = {
            "status": "SUCCESS",
            "vehicle": {
                "name": "test_tp",
                "company_id": "4",
                // "mab_expired": null,
                // "type": null,
                // "updated_at": "2017-10-27 22:18:20",
                // "created_at": "2017-10-27 22:18:20",
                // "id": 12,
                "companies_list": {
                    "id": 4,
                    "name": "Malindo",
                    "code": "malindo",
                    "created_at": null,
                    "updated_at": null
                },
                "last_check": null,
                "last_breakdown": null,
                "today_checkin": false,
                // "today_checkin_list": null,
                "breakdown": false
            }
        }
    } else if(resourceKey == 'userRs.create') {
        mockResponse = {
            "status": "SUCCESS",
            "user": {
                "id": 3,
                "username": "user",
                "user_level": "3",
                "create_by": null,
                "created_at": null,
                "updated_at": null,
                "companies_list": [],
                "userlvl": {
                    "id": 3,
                    "role": "User",
                    "code": "user",
                    "created_at": null,
                    "updated_at": null
                }
            }
        }
    } else if(resourceKey == 'userListRs.save') {
        mockResponse = {
            users: [
                {
                    username: 'user 1'
                },
                {
                    username: 'user 2'
                }
            ]
        }
    }
    successCallback(mockResponse);
}