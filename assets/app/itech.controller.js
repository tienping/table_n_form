(function() {
    'use strict';

    angular
        .module('itech.controller',[])
        .controller('itechCtrl', itechCtrl)
        .filter('toHourMinute', toHourMinute)
        .filter('getVehicleName', getVehicleName)
        .filter('getCompanyName', getCompanyName)
        .filter('getUserLevelName', getUserLevelName)
        .filter('validBreak', validBreak)
        .filter('companyFilter', companyFilter)
        .filter('monthFilter', monthFilter);

    itechCtrl.$inject = ['$scope', '$rootScope', '$state', 'userRs', 'userListRs', 'vehicleRs', 'vehicleListRs', 'reportRs', 'Excel', '$timeout', '$location'];
    function itechCtrl($scope, $rootScope, $state, userRs, userListRs, vehicleRs, vehicleListRs, reportRs, Excel, $timeout, $location) {
        var itech = this;
        
        itech.init           = init;
        itech.getVehicle     = getVehicle;
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
            vehicle: [],
            userlist: [],
            reports: []
        }
        itech.selectedMonth = "06/2017";
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

        itech.userLevels = [
            {
                label: 'Manager',
                key: 1
            }, {
                label: 'Technician',
                key: 2
            }, {
                label: 'Guest',
                key: 3
            }
        ];

        itech.companies = [{
            key: 'AA_RAMP',
            label: 'AA RAMP',
            company_id: 1,
            company_name: 'AA RAMP'
        },{
            key: 'AA_ENGINEERING',
            label: 'AA ENGINEERING',
            company_id: 2,
            company_name: 'AA ENGINEERING'
        },{
            key: 'AAX_ENGINEERING',
            label: 'AAX ENGINEERING',
            company_id: 3,
            company_name: 'AAX ENGINEERING'
        },{
            key: 'AAX_RAMP',
            label: 'AAX RAMP',
            company_id: 4,
            company_name: 'AAX RAMP'
        },{
            key: 'ACWER',
            label: 'ACWER',
            company_id: 5,
            company_name: 'ACWER'
        },{
            key: 'AirAsia_Charter',
            label: 'AirAsia Charter',
            company_id: 6,
            company_name: 'AirAsia Charter'
        },{
            key: 'MACKT_M',
            label: 'MACKT_M',
            company_id: 7,
            company_name: 'MACKT_M'
        },{
            key: 'PCA',
            label: 'PCA',
            company_id: 8,
            company_name: 'PCA'
        },{
            key: 'MALINDO',
            label: 'MALINDO',
            company_id: 9,
            company_name: 'MALINDO'
        },{
            key: 'VISION_VR',
            label: 'VISION V.R.',
            company_id: 10,
            company_name: 'VISION V.R.'
        }]

        itech.selectedCompany = '';

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

        itech.vehicleForm = {
            id: 'vehicle-form',
            resourceKey: 'vehicle',
            messages: [],
            title: 'Vehicle',
            isBusy: false,
            field: {
                company: '',
                name: '',
                mab_expired: ''
            }
        };
        itech.userForm = {
            id: 'user-form',
            resourceKey: 'user',
            messages: [],
            title: 'User',
            isBusy: false,
            field: {
                username: '',
                password: '',
                user_level: ''
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
    
                if (!itech.data.vehicle.length) {
                    itech.getVehicle();
                }
            }
        }

        function getVehicle(page) {
            var page = page || 1;

            if (itech.data.vehiclePaginator && itech.data.vehiclePaginator.page == page) {
                return;
            }

            itech.data.vehicleloading = true;
            vehicleListRs.save({
                page: page
            }, function successCallback(response) {
                itech.data.vehicle = response.vehicles;
                itech.data.vehiclePaginator = response.paginator;
                itech.data.vehiclePaginator.pageArr = [];
                for (var i = 1, len = itech.data.vehiclePaginator.total_page; i <= len; i++) {
                    itech.data.vehiclePaginator.pageArr.push(i);
                }
                itech.data.vehicleloading = false;
            }, function failureCallback(response) {
                console.log('Vehicle list request failed. Please consult system admin.', response);
            });
        }

        function getReports(page, param) {
            var dateArr = [];
            var page = page || 1;

            if (!itech.token && $state.current.name !== 'login') {
                $state.go('login');
            } else {
                if (!itech.data.reports.length || param === 'update') {
                    itech.data.reportsloading = true;
                    itech.data.reportDate = {};
                    if (itech.selectedMonth){
                        dateArr = itech.selectedMonth.split('/');
                        var monthValue = parseInt(dateArr[0]);
                        var monthString = monthValue < 10 ? '0' + monthValue : '' + monthValue;
                        itech.data.reportDate['year'] = dateArr[1];
                        itech.data.reportDate['month'] = monthString;
                        itech.data.reportDate['page'] = page;
                    }
                    reportRs.save(itech.data.reportDate, function successCallback(response) {
                        itech.data.reports = response.vehicles;
                        itech.data.reportsloading = false;
                        itech.data.reportsPaginator = response.paginator;
                        itech.data.reportsPaginator.pageArr = [];
                        for (var i = 1, len = itech.data.reportsPaginator.total_page; i <= len; i++) {
                            itech.data.reportsPaginator.pageArr.push(i);
                        }
                    }, function failureCallback(response) {
                        console.log('Reports request failed. Please consult system admin.', response);
                    });
                }
            }
        }

        function getUserList(page) {
            var page = page || 1;
            
            if (itech.data.userPaginator && itech.data.userPaginator.page == page) {
                return;
            }

            userListRs.save({
                page: page
            }, function successCallback(response) {
                itech.data.userlist = response.users;
                itech.data.userPaginator = response.paginator;
                itech.data.userPaginator.pageArr = [];
                for (var i = 1, len = itech.data.userPaginator.total_page; i <= len; i++) {
                    itech.data.userPaginator.pageArr.push(i);
                }
            }, function failureCallback(response) {
                console.log('Vehicle list request failed. Please consult system admin.', response);
            });
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

            if (data.id == 'vehicle-form' && data.field.param != 'delete') {
                if (!data.field.company_id) {
                    data.messages.push({text: 'Please chose a company.'});
                }
                if (!data.field.name) {
                    data.messages.push({text: 'Please assign a name.'});
                }
            } else if (data.id == 'user-form') {
                if (!data.field.username) {
                    data.messages.push({text: 'Please chose a username.'});
                }
                if (!data.field.user_level) {
                    data.messages.push({text: 'Please assign user level.'});
                }
                if (data.field.param !== 'delete') {
                    if (data.field.user_level == '3') {
                        if (!data.field.selected_company) {
                            data.messages.push({text: 'Please assign company for guest user.'});
                        } else {
                            data.field.companies = [data.field.selected_company];
                        }
                    } else {
                        data.field.companies = [];
                    }
                }

                if (!data.field.password) {
                    delete data.field.password;
                }
            }

            if (data.messages.length) { return; }

            if (data.isBusy) {
                data.messages.push({text: 'Data processing, please wait.'});
                return;
            }
            data.isBusy = true;

            var resource = undefined;
            if (data.resourceKey == 'user') {
                resource = userRs;
            } else {
                resource = vehicleRs;
            }

            resource.save(data.field, function successCallback(response) {
                if (response.status == 'SUCCESS') {
                    location.reload();
                } else {
                    data.messages.push({text: JSON.stringify(response.errors)});
                }
                data.isBusy = false;
            }, function failureCallback(response) {
                alert('Form submit fail...', response);
                data.isBusy = false;
            });
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
                    if (parseInt(id) === parseInt(item.company_id)) {
                        return item.label;
                    }
                }
            }
            return id;
        }
    }
    
    function getUserLevelName() {
        return function(id, arr) {
            if (id) {
                for (var i = 0, len = arr.length; i < len; i++) {
                    var item = arr[i];
                    if (parseInt(id) === parseInt(item.key)) {
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
                if (breakdownType.key === breakdownType.key && items[breakdownType.key]) {
                    validated.push(breakdownType.label);
                }
            });
            return validated;
        };
    }

    function companyFilter() {
        return function(items, selectedCompany) {
            var filtered = [];
            if (selectedCompany && selectedCompany.company_id) {
                angular.forEach(items, function(item) {
                    if (parseInt(item.company_id) === parseInt(selectedCompany.company_id)) {
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