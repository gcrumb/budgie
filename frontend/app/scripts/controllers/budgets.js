'use strict';

/* Budget controller(s) */

angular.module('pippDataApp.controllers.budgets', [])
    .controller('BudgetCtrl', ['$scope', '$location', 'BudgetFactory', function ($scope, $location, BudgetFactory) {

	var rawFromCouch = {}; // Keep the complete data in frontend
	var rawFromDrill = {}; // Current mashed-up reduced data of interest
	// Convenient mapping paths (e.g.
	// {'Department of Health': 'root.depart-health',
	//  'Program of Public Health': 'root.depart-health.prg-pub-hea'})
	var pathMappings = {}; 
	var path = 'root'; // Initialize path to root of budget data tree

	var budget = BudgetFactory.get('png-2013').
		success(function(data, status, headers, config) {
		    // this callback will be called asynchronously
		    // when the response is available

		    pathMappings = getPathMappings(data);
		    console.log("Path mappings: ", pathMappings);

		    rawFromCouch = data; 
		    console.log("Data as stored in CouchDB: ",rawFromCouch);

		    // The drill function returns some raw data which
		    // is used within this controller to fullfil the
		    // features (chart data, further drill paths,
		    // information box summary data...).
		    
		    rawFromDrill = drill(rawFromCouch,path);
		    console.log("Data as processed by drill: ",rawFromDrill);

		    process();

		}).
		error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});

	var process = function () {
	    
	    console.log("Processing data for display...");

	    // Pie chart side
	    $scope.name = rawFromDrill.name;
	    $scope.level = rawFromDrill.level;
	    $scope.pieChartData = getPieChartData(rawFromDrill.categories);
	    console.log("Pie Data:", getPieChartData(rawFromDrill.categories));

	    // Information box and bar chart side. 
	    $scope.notes = rawFromDrill.notes;
	    $scope.stackedBarChartData = getBarChartData(rawFromDrill.data);

	};

        $scope.xFunction = function(){
            return function(d) {
                return d.key;
            };
        };

        $scope.yFunction = function(){
            return function(d) {
                return d.y;
            };
        };

        $scope.$on('tooltipShow.directive', function(event){
            //console.log('scope.tooltipShow', event);
        });

        $scope.$on('tooltipHide.directive', function(event){
            //console.log('scope.tooltipHide', event);
        });

        $scope.$on('stateChange.directive', function(event){
            console.log('stateChange.directive', event);
        });

        $scope.$on('elementClick.directive', function(event,data){
	    path = pathMappings[data.label];
            console.log("Clicked: ", data.label, " Path: ", path);
	    rawFromDrill = drill(rawFromCouch,path);
	    process();
        });

    }]);
