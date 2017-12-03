(function() {
    'use strict';

    angular
        .module('itech.controller',[])
        .controller('itechCtrl', itechCtrl)
        .filter('toHourMinute', toHourMinute)
        .filter('getVehicleName', getVehicleName)
        .filter('getCompanyName', getCompanyName)
        .filter('validBreak', validBreak)
        .filter('companyFilter', companyFilter)
        .filter('monthFilter', monthFilter);

    itechCtrl.$inject = ['$scope', '$rootScope', '$state', 'userRs', 'vehicleRs', 'reportRs', 'Excel', '$timeout', '$location'];
    function itechCtrl($scope, $rootScope, $state, userRs, vehicleRs, reportRs, Excel, $timeout, $location) {
        var itech = this;
        
        itech.init           = init;
        itech.getReports     = getReports;
        itech.getUserList    = getUserList;
        itech.openModal      = openModal;
        itech.closeModal     = closeModal;
        itech.toggleLanguage = toggleLanguage;
        itech.loginSubmit    = loginSubmit;
        itech.logoutSubmit   = logoutSubmit;
        itech.changeTab      = changeTab;
        itech.printTable     = printTable;
        itech.exportToExcel  = exportToExcel;
        itech.initDailyCheckForm   = initDailyCheckForm;
        itech.dailyReportSubmit     = dailyReportSubmit;
        itech.breakdownSubmit     = breakdownSubmit;
        itech.breakFixedSubmit     = breakFixedSubmit;
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
                label: 'Engine Oil',
                key: 'engine_oil'
            },
            {
                label: 'Tranmission Oil',
                key: 'transmission_oil'
            },
            {
                label: 'Brake Oil',
                key: 'brake_oil'
            },
            {
                label: 'Steering Oil',
                key: 'steering_oil'
            },
            {
                label: 'Radiator Water',
                key: 'radiator_water'
            },
            {
                label: 'Front & Rear Light',
                key: 'front_n_rear_light'
            },
            {
                label: 'Beacon Light',
                key: 'beacon_light'
            },
            {
                label: 'Brake Condition',
                key: 'brake_condition'
            },
            {
                label: 'Belting',
                key: 'belting'
            },
            {
                label: 'Brake Light Left & Right',
                key: 'brake_light_left_n_right'
            },
            {
                label: 'Hand Brake',
                key: 'hand_brake'
            },
            {
                label: 'Seat Condition',
                key: 'seat_condition'
            }
        ];

        itech.companies = [
            {
                label: 'All Company',
                key: null
            }, {
                label: 'AA RAMP',
                key: '1'
            }, {
                label: 'AA ENGINEERING',
                key: '2'
            }, {
                label: 'AAX ENGINEERING',
                key: '3'
            }, {
                label: 'AAX RAMP',
                key: '4'
            }, {
                label: 'ACWER',
                key: '5'
            }, {
                label: 'AirAsia Charter',
                key: '6'
            }, {
                label: 'MACKT_M',
                key: '7'
            }, {
                label: 'PCA',
                key: '8'
            }, {
                label: 'MALINDO',
                key: '9'
            }, {
                label: 'VISION V.R.',
                key: '10'
            }
        ];
        itech.selectedCompany = itech.companies[0];

        itech.breakdownTypes = [
            {
                label: 'Engine',
                key: 'engine'
            }, {
                label: 'Transmission Gear Box',
                key: 'transmission_gear_box'
            }, {
                label: 'Front Axle',
                key: 'front_axle'
            }, {
                label: 'Rear Axle',
                key: 'rear_axle'
            }, {
                label: 'Brake',
                key: 'brake'
            }, {
                label: 'Radiator Colling System',
                key: 'radiator_cooling_system'
            }, {
                label: 'Hydrauic System',
                key: 'hydrauic_system'
            }, {
                label: 'Electrical System',
                key: 'electrical_system'
            }, {
                label: 'Body',
                key: 'body'
            }, {
                label: 'Other',
                key: 'other'
            }
        ];

        itech.loginForm = {
            id: 'login',
            messages: [],
            title: 'Login',
            isBusy: false,
            username: '',
            password: ''
        }

        itech.addVehicleForm = {
            id: 'vehicle-form',
            messages: [],
            title: 'Vehicle',
            isBusy: false,
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
            isBusy: false,
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
            isBusy: false,
            field: {}
        };
        itech.breakdownReport = {
            id: 'breakdown-report-form',
            messages: [],
            title: 'Breakdown Report',
            isBusy: false,
            field: {}
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
            if (!itech.token && $state.current.name !== 'login') {
                $state.go('login');
            } else {
                var offsetValue = 50;
                initializeSmoothScroll(offsetValue);
    
                if (!itech.data.vehicle) {
                    vehicleRs.save({
                        param: 'list'
                    }, function successCallback(response) {
                        itech.data.vehicle = response.vehicles;
                    }, function failureCallback(response) {
                        console.log('Vehicle list request failed. Please consult system admin.', response);
                    });
                }
            }
        }

        function getReports(param) {
            var dateArr = [];

            if (!itech.token && $state.current.name !== 'login') {
                $state.go('login');
            } else {
                if (!itech.data.reports || param === 'update') {
                    itech.data.reportDate = {};
                    if (itech.selectedMonth){
                        dateArr = itech.selectedMonth.split('/');
                        var monthValue = parseInt(dateArr[0]);
                        var monthString = monthValue < 10 ? '0' + monthValue : '' + monthValue;
                        itech.data.reportDate['year'] = dateArr[1];
                        itech.data.reportDate['month'] = monthString;
                    }

                    reportRs.save(itech.data.reportDate, function successCallback(response) {
                        itech.data.reports = response.vehicles;
                    }, function failureCallback(response) {
                        console.log('Reports request failed. Please consult system admin.', response);
                    });
                }
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
            userRs.save({
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
                console.log('Login Failed... Please consult system administrator.', response);
            });
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

        function initDailyCheckForm(fields, dataArr) {
            angular.forEach(dataArr, function(value, key) {
                switch(key) {
                    case 'id':
                    case 'vehicle_id':
                    case 'company_id':
                    case 'time':
                    case 'distance':
                    case 'created_at':
                    case 'updated_at':
                        fields[key] = value;
                        break;
                    default:
                        fields[key] = value === '1' ? true : false;
                }
            });

            return fields;
        }

        function dailyReportSubmit(data) {
            data.messages = [];

            if (data.isBusy) {
                data.messages.push({text: 'Data processing, please wait.'});
                return;
            }
            data.isBusy = true;
            
            if (!data.field.company_id) {
                data.messages.push({text: 'Please set company.'});
            }
            if (!data.field.vehicle_id) {
                data.messages.push({text: 'Please set vehicle.'});
            }

            if (data.messages.length) { return; }
            
            data.field.param = 'check-list';
            vehicleRs.save(data.field, function successCallback(response) {
                if (response.status == 'SUCCESS') {
                    location.reload();
                }
            }, function failureCallback(response) {
                alert('Form submit fail...', response);
                data.isBusy = false;
            });
        }

        function breakdownSubmit(data) {
            data.messages = [];

            if (data.isBusy) {
                data.messages.push({text: 'Data processing, please wait.'});
                return;
            }
            data.isBusy = true;
            
            angular.forEach(itech.breakdownTypes, function(type) {
                data.field[type.key] = 0;
            });
            data.field[data.field.breakdownType] = 1;

            if (!data.field.vehicle_id) {
                data.messages.push({text: 'Please set Vehicle.'});
            }
            if (!data.field.breakdownType) {
                data.messages.push({text: 'Please set Breakdown Type .'});
            }

            if (data.messages.length) { return; }
            
            data.field.param = 'breakdown';
            vehicleRs.save(data.field, function successCallback(response) {
                if (response.status == 'SUCCESS') {
                    location.reload();
                }
            }, function failureCallback(response) {
                alert('Form submit fail...', response);
                data.isBusy = false;
            });
        }

        function breakFixedSubmit(data) {
            data.messages = [];

            if (data.isBusy) {
                data.messages.push({text: 'Data processing, please wait.'});
                return;
            }
            data.isBusy = true;
            
            if (!data.field.vehicle_id) {
                data.messages.push({text: 'Please set Vehicle.'});
            }

            if (data.messages.length) { return; }
            
            data.field.param = 'fixed-breakdown';
            vehicleRs.save(data.field, function successCallback(response) {
                if (response.status == 'SUCCESS') {
                    location.reload();
                }
            }, function failureCallback(response) {
                alert('Form submit fail...', response);
                data.isBusy = false;
            });
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

            vehicleRs.save(data.field, function successCallback(response) {
                if (response.status == 'SUCCESS') {
                    itech.data.vehicle.push(response.vehicle);
                    itech.closeModal('add-' + key);
                }
            }, function failureCallback(response) {
                alert('Form submit fail...', response);
            }, key + 'Rs.create');
        }

        function printTable(tableQuery) {
            var divToPrint = $(tableQuery);
            var newWin = window.open("");
            newWin.document.write(divToPrint[0].outerHTML);
            newWin.print();
            newWin.close();
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
            var chunks = input.split(':');

            var hours = parseInt(input / 60);
            var minutes = input % 60;

            if (chunks.length > 1) {
                hours = parseInt(chunks[0]);
                minutes = parseInt(chunks[1]);
            } else {
                hours = parseInt(input / 60);
                minutes = parseInt(input % 60);
            }

            
            if (hours) {
                return hours+' hr' + ' ' + minutes + ' min';
            } else {
                return minutes + ' min';
            }
        }
    }

    function getVehicleName() {
        return function(id, arr) {
            if (id) {
                for (var i = 0, len = arr.length; i < len; i++) {
                    var item = arr[i];
                    if (eval(id) === item.id) {
                        return item.name;
                    }
                }
            }
            return id;
        }
    }
    
    function getCompanyName() {
        return function(id, arr) {
            if (id) {
                for (var i = 0, len = arr.length; i < len; i++) {
                    var item = arr[i];
                    if (id === item.key) {
                        return item.label;
                    }
                }
            }
            return id;
        }
    }
    
    function validBreak() {
        return function(items, breakdownTypes) {
            var validated = [];

            angular.forEach(breakdownTypes, function(breakdownType) {
                if (items[breakdownType.key] === '1') {
                    validated.push(breakdownType.label);
                }
            });
            return validated;
        };
    }

    function companyFilter() {
        return function(items, selectedCompany) {
            var filtered = [];
            if (selectedCompany.key) {
                angular.forEach(items, function(item) {
                    if (item.company_id === selectedCompany.key) {
                        filtered.push(item);
                    }
                });
            } else {
                filtered = items;
            }
            return filtered;
        };
    }

    function monthFilter() {
        return function(items, selectedMonth) {
            // return whole array for now
            return items;

            // if need to sort using js
            var filtered = [];
            if (selectedMonth) {
                var dateArr = selectedMonth.split('/');
                var monthStr = dateArr[1] + '-' + dateArr[0];

                angular.forEach(items, function(item) {
                    if (item.report.month === monthStr) {
                        filtered.push(item);
                    }
                });
            } else {
                filtered = items;
            }
            return filtered;
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