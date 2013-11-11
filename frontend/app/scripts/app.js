'use strict';

// Create a new module for the PiPP Data Application
var pippDataApp = angular.module('pippDataApp',
                                 ['ngRoute', 'pippDataApp.controllers.main']);

// Add configuration and routes to the module
pippDataApp.config(['$routeProvider',  function ($routeProvider) {

    // This app only supports browsers with html5 support?!? Probably not...
    // $locationProvider.html5Mode(true);

    $routeProvider
	.when('/', {templateUrl: 'views/main.html', controller: 'MainCtrl'})
	.otherwise({redirectTo: '/'});

}]);
