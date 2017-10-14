(function() {
    'use strict';

    var apiUrl = 'http://chama666.com/itec/public/api/1.0';
    if (DEBUG_MODE) {
        apiUrl = "https://cors-anywhere.herokuapp.com/" + apiUrl;
    }

    angular
        .module('itech.resources', ['ngResource'])
        .factory('userRs', userRs)
        .factory('vehicleRs', vehicleRs)
        .factory('reportRs', reportRs);

    userRs.$inject = ['$resource'];
    vehicleRs.$inject = ['$resource'];
    reportRs.$inject = ['$resource'];

    function userRs($resource) {
        // USER_LOGIN_API = '/user/login' - done
        // USER_LIST_API = '/user/list'
        // USER_CREATE_API = '/user/create'
        // USER_UPDATE_API = '/user/edit'

        return $resource(apiUrl + '/user/:param', { param: '@param' });
    }

    function vehicleRs($resource) {
        // VEHICLE_VIEW_API = '/vehicle/view'
        // VEHICLE_LIST_API = '/vehicle/list'
        // VEHICLE_CREATE_API = '/vehicle/create'
        // VEHICLE_UPDATE_API = '/vehicle/edit'
        // VEHICLE_FIXED_API = '/vehicle/fixed-breakdown'
        // VEHICLE_DAILY_API = '/vehicle/check-list'
        // VEHICLE_BREAKDOWN_API = '/vehicle/breakdown'

        return $resource(apiUrl + '/vehicle/:param', { param: '@param' });
    }

    function reportRs($resource) {
        // REPORT_API = '/reports'

        return $resource(apiUrl + '/reports');
    }
})();