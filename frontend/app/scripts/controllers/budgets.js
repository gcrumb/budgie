'use strict';

/* Budget controller(s) */

angular.module('pippDataApp.controllers.budgets', [])
    .controller('BudgetCtrl', ['$scope', '$location', 'BudgetFactory', function ($scope, $location, BudgetFactory) {

	var budgetRawData = {};

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

	    // Prepare the chart data here before passing to scope
	    var chartData = []; 

	    /* Just using 'recur' for now to get the logic working */
	    for(var i=0; i<budgetRawData.categories.length; i++) {
		chartData.push(
		    {key: budgetRawData.categories[i].name, 
		     y: budgetRawData.categories[i]['current-data'].recur
		    }
		);
	    }

	    $scope.name = budgetRawData.name;
	    $scope.level = budgetRawData.level;
	    $scope.pieChartData = chartData;

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

    }]);
