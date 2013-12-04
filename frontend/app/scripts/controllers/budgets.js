'use strict';

/* Budget controller(s) */

angular.module('pippDataApp.controllers.budgets', ['ui.bootstrap', 'ngAnimate'])
    .controller('BudgetCtrl', ['$scope', '$location', 'BudgetFactory', function ($scope, $location, BudgetFactory) {

	var rawFromCouch = {}; // Keep the complete data set in frontend
	var rawFromDrill = {}; // Current mashed-up reduced data of interest
	var pathMappings = {}; // Convenient path mappings
	var path = 'root'; // Initialize path to root of budget data tree
	var drillableMappings = {"Other": true}; // Current drillable mappings
	var country = 'png';
	var current_year = '2014';
	var currentDocument = country + '-' + current_year;

	$scope.breadcrumbs = []; // Initialize breadcrumbs 
	$scope.showOthers = false;

	var budget = BudgetFactory.get(currentDocument).
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

	    // This will continuously populate (well, update when
	    // property is present) so it is not quite the most
	    // efficient approach. However, it does not cost much and
	    // works for now. Better to eventually get all the
	    // drillable mappings once on page load and be done with
	    // it. In Dan's words, I took the path of least resistance :)
	    rawFromDrill.categories.forEach(function(elem) {
		drillableMappings[elem.name] = elem.drillable;
	    });

	    console.log("Drillables: ", drillableMappings);

	    if( Object.prototype.toString.call( pie ) === '[object Array]' ) {
		// No grouping into "others"
		$scope.pieChartData = pie;
		// No gat "others" bar chart data
		$scope.othersBarChartData = undefined;
	    } else {
		// With "others" group
		$scope.pieChartData = pie['top'];
		// Others bar chart
		$scope.othersBarChartData = pie['Other'];
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
	    
	    $scope.showOthers = false;

	    // change if logic here...but first get things working
	    if (data.label === 'Other') {
		console.log("Path: ", path);
		$scope.showOthers = true;
	    } else {
		console.log("Before push: ", rawFromDrill);
		
		if (drillableMappings[data.label] === true) {
		    $scope.breadcrumbs.push(data.label);
		}
		path = pathMappings[data.label];
		rawFromDrill = drill(rawFromCouch,path);
	    }	    
	    process();
	    
        });

	$scope.radioModel =  'spending';

	// Handle the choice of spending, revenue or finance data
	//$scope.$on('recordSelect.directive', function (data){
	$scope.recordSelect = function (which){

	    $scope.radioModel = which;
	    currentDocument = country + '-' + current_year;
	    currentDocument = which !== 'spending' ? currentDocument + '-' + which : currentDocument;

	    var my_budget = BudgetFactory.get(currentDocument).
		success(function(data, status, headers, config) {
		    pathMappings = getPathMappings(data);
		    path = 'root';
		    rawFromCouch = data; 

		    rawFromDrill = drill(rawFromCouch,path);
		    $scope.breadcrumbs = [rawFromDrill.name];

		    process();

		}).
		error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});

	};

        $scope.reloadBreadcrumbs = function(crumb){
	    $scope.showOthers = false;
	    $scope.breadcrumbs = sliceByStringElement($scope.breadcrumbs,crumb);
	    path = pathMappings[crumb];
	    rawFromDrill = drill(rawFromCouch, path);
	    process();
        };	

    }]);
