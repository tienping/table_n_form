(function() {
    'use strict';

    angular
        .module('itech.controller',[])
        .controller('itechCtrl', itechCtrl);

    itechCtrl.$inject = ['$scope', '$rootScope', '$state', 'userRs', 'vehicleRs', 'reportRs', 'Excel', '$timeout'];
    function itechCtrl($scope, $rootScope, $state, userRs, vehicleRs, reportRs, Excel, $timeout) {
        var itech = this;
        
        itech.init           = init;
        itech.openModal      = openModal;
        itech.toggleLanguage = toggleLanguage;
        itech.loginSubmit    = loginSubmit;
        itech.logoutSubmit   = logoutSubmit;
        itech.initHome       = initHome;
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
                label: 'Daily & Breakdown',
                key: 'daily_and_breakdown',
                type: 'list'
            }, {
                label: 'Report',
                key: 'report',
                type: 'report'
            }
        ];
        itech.tabSelected     = itech.homeSelections[0];
        

        // itech.data      = {
        //     en: {},
        //     bm: {}
        // }
        // loadJSON('assets/fixture-en.json', function(response) {
        //     itech.data.en = JSON.parse(response);
        // });
        // loadJSON('assets/fixture-bm.json', function(response) {
        //     itech.data.bm = JSON.parse(response);
        // });
        // itech.lang      = itech.lang || 'en';

        $scope.slider = {
            value: 500,
            options: {
                floor: 500,
                ceil: 3000,
                step: 500
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
        }

        function openModal(id) {
            $('#' + id).modal('show');
        }

        function toggleLanguage(lang) {
            setCookie('tp-lang', lang, 3);
            location.reload();
        }

        function loginSubmit() {
            userRs.save({
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
            });
        }

        function logoutSubmit() {
            var tokenString = 'login-cookie-token-string';
            setCookie(TOKEN_KEY, '', 0);
            itech.token = null;
            location.reload();
        }

        function initHome() {
            if (!itech.data.vehicle) {
                vehicleRs.save({
                    param: 'list'
                }, function successCallback(response) {
                    itech.data.vehicle = response.vehicles;
                }, function failureCallback(response) {
                    
                });
            }
        }

        function changeTab(key) {
            
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
})();