'use strict';

/* Main controllers */

angular.module('pippDataApp.controllers.main', [])
    .controller('MainCtrl', ['$scope', '$location', function ($scope, $location) {
	$scope.awesomeThings = [
	    'HTML5 Boilerplate',
	    'AngularJS',
	    'Karma'
	];

	console.log($location.path());
    }]);
