(function() {
    'use strict';

    angular
        .module('itech.resources', ['ngResource'])
        .factory('userRs', userRs)
        .factory('userListRs', userListRs)
        .factory('vehicleRs', vehicleRs)
        .factory('vehicleListRs', vehicleListRs)
        .factory('reportRs', reportRs);

    userRs.$inject = ['$resource'];
    userListRs.$inject = ['$resource'];
    vehicleRs.$inject = ['$resource'];
    vehicleListRs.$inject = ['$resource'];
    reportRs.$inject = ['$resource'];

    function userRs($resource) {
        return $resource(API_URL + '/user/:param', { param: '@param' });
    }
    
    function userListRs($resource) {
        return $resource(API_URL + '/user/list?page=:page', { page: '@page' });
    }

    function vehicleRs($resource) {
        return $resource(API_URL + '/vehicle/:param', { param: '@param' });
    }

    function vehicleListRs($resource) {
        return $resource(API_URL + '/vehicle/list?page=:page', { page: '@page' });
    }

    function reportRs($resource) {
        return $resource(API_URL + '/reports?page=:page', { page: '@page' });
    }
})();