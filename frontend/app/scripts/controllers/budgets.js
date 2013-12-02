'use strict';

/* Budget controller(s) */

angular.module('pippDataApp.controllers.budgets', [])
    .controller('BudgetCtrl', ['$scope', '$location', 'BudgetFactory', function ($scope, $location, BudgetFactory) {

	var rawFromCouch = {}; // Keep the complete data set in frontend
	var rawFromDrill = {}; // Current mashed-up reduced data of interest
	var pathMappings = {}; // Convenient path mappings
	var path = 'root'; // Initialize path to root of budget data tree

	$scope.breadcrumbs = []; // Initialize breadcrumbs 

	var budget = BudgetFactory.get('png-2014').
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

		    $scope.breadcrumbs.push(rawFromDrill.name);

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
	    console.log("Pie Data:", getPieChartData(rawFromDrill.categories));
	    
	    var pie = getPieChartData(rawFromDrill.categories);

	    if( Object.prototype.toString.call( pie ) === '[object Array]' ) {
		// No grouping into "others"
		$scope.pieChartData = pie;
		// No gat "others" bar chart data
		$scope.othersBarChartData = undefined;
	    } else {
		// With "others" group
		$scope.pieChartData = pie['top'];
		// Others bar chart
		$scope.othersBarChartData = pie['others'];
	    }

	    // Information box and bar chart side. 
	    $scope.notes = rawFromDrill.notes;
	    $scope.stackedBarChartData = getBarChartData(rawFromDrill.data);

	};

	$scope.tooltipContent = function(key, x, y, e, graph) {
	    // This is just here so I have a placeholder 
	    // for actual, you know, not fugly code
            return '<h3>' + key + '</h3>' +
		'<p>' + (parseFloat(y.value) * 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<br />KINA</p>';
	};

	$scope.barChartTooltips = function(key, x, y, e, graph) {
            return '<h3>' + x + '</h3>' +
		'<p>' + int2roundKMG(y) + '<br />KINA</p>';
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
            //console.log('stateChange.directive', event);
        });

        $scope.$on('elementClick.directive', function(event,data){
	    path = pathMappings[data.label];
            //console.log("Clicked: ", data.label, " Path: ", path);
	    $scope.breadcrumbs.push(data.label);
	    rawFromDrill = drill(rawFromCouch,path);
	    process();
        });

        $scope.reloadBreadcrumbs = function(crumb){

	    $scope.breadcrumbs = sliceByStringElement($scope.breadcrumbs,crumb);
	    path = pathMappings[crumb];
	    rawFromDrill = drill(rawFromCouch, path);
	    process();
        };	

    }]);
