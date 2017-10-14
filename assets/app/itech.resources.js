(function() {
    'use strict';

    var apiUrl = 'http://chama666.com/itec/public/api/1.0/';
    if (DEBUG_MODE) {
        apiUrl += "https://cors.io/?";
    }

    angular
        .module('itech.resources', ['ngResource'])
        .factory('loginRs', loginRs);

    loginRs.$inject = ['$resource'];

    function loginRs($resource) {
        return $resource(apiUrl + 'user/login');
        // auth.data = $resource(API_URL + '/xxx/:id', { id: '@id' });
    }
})();