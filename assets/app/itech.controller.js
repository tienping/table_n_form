(function() {
    'use strict';

    angular
        .module('itech.controller',[])
        .controller('itechCtrl', itechCtrl);

    itechCtrl.$inject = ['$scope', '$rootScope', '$state', 'loginRs', 'Excel', '$timeout'];
    function itechCtrl($scope, $rootScope, $state, loginRs, Excel, $timeout) {
        var itech = this;
        
        itech.init           = init;
        itech.openModal      = openModal;
        itech.toggleLanguage = toggleLanguage;
        itech.loginSubmit    = loginSubmit;
        itech.logoutSubmit   = logoutSubmit;
        itech.exportToExcel  = exportToExcel;

        itech.token           = getCookie('itech-auth');
        itech.currentLanguage = getCookie('tp-lang') || 'en';

        itech.homeSelections  = [
            {
                label: 'Daily',
                key: 'daily',
                type: 'list'
            }, {
                label: 'Breakdown',
                key: 'breakdown',
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
            setCookie("tp-lang", lang, 3);
            location.reload();
        }

        function loginSubmit() {
            // // test 
            // var tokenString = 'login-cookie-token-string';
            // setCookie("itech-auth", tokenString, 3);
            // itech.token = tokenString;
            // $state.go('home');
            
            loginRs.save({
                "username": "admin",
                "password": "password"
            }, function successCallback() {
                var tokenString = 'login-cookie-token-string';
                setCookie("itech-auth", tokenString, 3);
                itech.token = tokenString;
                $state.go('home');
            }, function failureCallback() {
                alert('Login Failed... Please consult system administrator.');
            });
        }

        function logoutSubmit() {
            var tokenString = 'login-cookie-token-string';
            setCookie("itech-auth", '', 0);
            itech.token = null;
            location.reload();
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