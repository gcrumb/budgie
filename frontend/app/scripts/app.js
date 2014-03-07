'use strict';

// Create a new module for the PiPP Data Application
var pippDataApp = angular.module('pippDataApp',
                                 ['pippDataApp.services.resources',
				  'pippDataApp.controllers.main',
				  'pippDataApp.controllers.budgets',
				  'pippDataApp.controllers.one-off-charts',
				  'ngRoute', 'ngResource',
				  'nvd3ChartDirectives']);

// Add configuration and routes to the module
pippDataApp.config(['$routeProvider',  function ($routeProvider) {

    // This app only supports browsers with html5 support?!? Probably not...
    // $locationProvider.html5Mode(true);

    $routeProvider
	.when('/', {templateUrl: 'views/main.html', controller: 'MainCtrl'})
	.when('/test', {templateUrl: 'views/test.html', controller: 'TestCtrl'})
	.when('/budget/:country/:year', {templateUrl: 'views/budget.html', controller: 'BudgetCtrl'})
        .when('/budget/vu/2014/at-a-glance', {templateUrl: 'views/vu-revenue-vs-expense.html', controller: 'oneOffChartsCtrl'})
        .when('/budget/vu/2014/scholarships', {templateUrl: 'views/vu-scholarships.html', controller: 'oneOffChartsCtrl'})
        .when('/budget/vu/2014/npps', {templateUrl: 'views/vu-npps.html', controller: 'oneOffChartsCtrl'})
	.otherwise({redirectTo: '/'});

}]);
