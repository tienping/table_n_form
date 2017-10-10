(function() {
    'use strict';
    var itechApp = angular.module('itechApp', ['ui.router', 'rzModule']);

    itechApp
        .config(itechConfig)
        .controller('itechCtrl', itechCtrl);

    itechConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

    function itechConfig($stateProvider, $urlRouterProvider) {
        var lang = getCookie('tp-lang') || 'en';

        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('home', {
            url: '/home',
            templateUrl: 'pages/home/home-' + lang + '.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'pages/login/login-' + lang + '.html'     
        });

    }

    itechCtrl.$inject = ['$scope', '$rootScope', '$state'];
    function itechCtrl($scope, $rootScope, $state) {
        var itech = this;
        
        itech.init           = init;
        itech.openModal      = openModal;
        itech.toggleLanguage = toggleLanguage;
        itech.loginSubmit    = loginSubmit;
        itech.logoutSubmit   = logoutSubmit;

        itech.token           = getCookie('itech-auth');
        itech.currentLanguage = getCookie('tp-lang') || 'en';

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
            var tokenString = 'login-cookie-token-string';
            setCookie("itech-auth", tokenString, 3);
            itech.token = tokenString;
            $state.go('home');
        }

        function logoutSubmit() {
            var tokenString = 'login-cookie-token-string';
            setCookie("itech-auth", '', 0);
            itech.token = null;
            location.reload();
        }
    }
})();