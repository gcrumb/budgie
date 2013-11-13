'use strict';

// Create a new module for the PiPP Data Application
var pippDataApp = angular.module('pippDataApp',
                                 ['pippDataApp.services.resources',
				  'pippDataApp.controllers.main',
				  'ngRoute', 'ngResource']);

// Add configuration and routes to the module
pippDataApp.config(['$routeProvider',  function ($routeProvider) {

    // This app only supports browsers with html5 support?!? Probably not...
    // $locationProvider.html5Mode(true);

    $routeProvider
	.when('/', {templateUrl: 'views/main.html', controller: 'MainCtrl'})
	.when('/test', {templateUrl: 'views/test.html', controller: 'TestCtrl'})
	.otherwise({redirectTo: '/'});

}]);
