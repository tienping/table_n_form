(function() {
    'use strict';
    angular
        .module('itech.main', ['ui.router', 'rzModule'])
        .config(itechConfig);

    itechConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

    function itechConfig($stateProvider, $urlRouterProvider) {
        var lang = getCookie('tp-lang') || 'en';

        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('home', {
            url: '/home',
            templateUrl: 'pages/home/home-' + lang + '.html'
        })
        .state('vehicles', {
            url: '/vehicles',
            templateUrl: 'pages/vehicles/vehicles-' + lang + '.html'     
        })
        .state('users', {
            url: '/users',
            templateUrl: 'pages/users/users-' + lang + '.html'     
        })
        .state('login', {
            url: '/login',
            templateUrl: 'pages/login/login-' + lang + '.html'     
        });
    }
})();