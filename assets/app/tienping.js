(function() {
    'use strict';
    angular
        .module('tienping.main', ['ui.router', 'rzModule'])
        .config(tienpingConfig);

    tienpingConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    function tienpingConfig($stateProvider, $urlRouterProvider, $httpProvider) {
        var token = getCookie(TOKEN_KEY);
        if (token) {
            $httpProvider.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }

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