(function() {
    'use strict';

    angular
        .module('itech.resources', ['ngResource'])
        .factory('userRs', userRs)
        .factory('vehicleRs', vehicleRs)
        .factory('vehicleListRs', vehicleListRs)
        .factory('reportRs', reportRs);

    userRs.$inject = ['$resource'];
    vehicleRs.$inject = ['$resource'];
    vehicleListRs.$inject = ['$resource'];
    reportRs.$inject = ['$resource'];

    function userRs($resource) {
        // USER_LOGIN_API = '/user/login' - done
        // USER_LIST_API = '/user/list'
        // USER_CREATE_API = '/user/create'
        // USER_UPDATE_API = '/user/edit'

        return $resource(API_URL + '/user/:param', { param: '@param' });
    }

    function vehicleRs($resource) {
        // VEHICLE_VIEW_API = '/vehicle/view'
        // VEHICLE_LIST_API = '/vehicle/list'
        // VEHICLE_CREATE_API = '/vehicle/create'
        // VEHICLE_UPDATE_API = '/vehicle/edit'
        // VEHICLE_FIXED_API = '/vehicle/fixed-breakdown - done'
        // VEHICLE_DAILY_API = '/vehicle/check-list' - done
        // VEHICLE_BREAKDOWN_API = '/vehicle/breakdown' - done
        return $resource(API_URL + '/vehicle/:param', { param: '@param' });
    }

    function vehicleListRs($resource) {
        return $resource(API_URL + '/vehicle/list?page=:page', { page: '@page' });
    }

    function reportRs($resource) {
        return $resource(API_URL + '/reports');
    }
})();