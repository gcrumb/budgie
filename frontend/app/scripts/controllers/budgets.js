'use strict';

/* Budget controller(s) */

angular.module('pippDataApp.controllers.budgets', [])
    .controller('BudgetCtrl', ['$scope', '$location', 'BudgetFactory', function ($scope, $location, BudgetFactory) {

	var budgetRawData = {};

	// Convenient mapping of paths
	// (e.g. {'Department of Health': 'root.depart-health',
        //        'Program of Public Health': 'root.depart-health.prg-pub-hea'})
	var pathMappings = {};

	var budget = BudgetFactory.get('png-2013').
		success(function(data, status, headers, config) {
		    // this callback will be called asynchronously
		    // when the response is available
		    console.log("Data as stored in CouchDB: ", data);

		    // The drill function returns some raw data which
		    // is used within this controller to fullfil the
		    // features (chart data, further drill paths,
		    // information box summary data...).
		    budgetRawData = drill(data,'root');
		    console.log("Data as processed by drill: ", budgetRawData);
		    process();
		}).
		error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});

	var process = function () {

	    // Pie chart side
	    $scope.name = budgetRawData.name;
	    $scope.level = budgetRawData.level;
	    $scope.pieChartData = getPieChartData(budgetRawData.categories);
	    console.log("Pie Data:", getPieChartData(budgetRawData.categories));

	    // Information box and bar chart side. 

	    // At the moment the model can take notes for every year
	    // so I am just extracting most recent notes here. This
	    // will change; again, just to get the thing going.
	    $scope.notes = budgetRawData.data['2013'].notes;

	    $scope.stackedBarChartData = getBarChartData(budgetRawData.data);

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

        $scope.$on('elementClick.directive', function(event,data){
            console.log('elementClick.directive', data);
        });

    }]);
