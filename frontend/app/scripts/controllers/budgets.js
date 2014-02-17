'use strict';

/* Budget controller(s) */

angular.module('pippDataApp.controllers.budgets', ['ui.bootstrap', 'ngAnimate', 'legendDirectives'])
    .controller('BudgetCtrl', ['$scope', '$location', '$routeParams', 'BudgetFactory', function ($scope, $location, $routeParams, BudgetFactory) {

	var rawFromCouch = {}; // Keep the complete data set in frontend
	var rawFromDrill = {}; // Current mashed-up reduced data of interest
	var pathMappings = {}; // Convenient path mappings
	var path = 'root'; // Initialize path to root of budget data tree
	var drillableMappings = {"Other": true}; // Current drillable mappings
	var country = $routeParams.country ? $routeParams.country : 'png';
	var current_year = $routeParams.year ? $routeParams.year : '2014';
	var currentDocument = country + '-' + current_year;

	// Use this for roll-up / unroll animations.
	var empty_pie = [{ 
        "label": "",
        "value" : 0
	}];

	var palettes = [
	    [
		'#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', 
		'#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
	    ],
	    [
		'#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', 
		'#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'
	    ],
	    [
		'#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', 
		'#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'
	    ],
	    [
		'#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', 
		'#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
	    ],
	    [
		'#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', 
		'#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'
	    ]
	];

	var this_level = 0;

	$scope.budget_currency = '';
	$scope.currency_multiplier = 1;
	$scope.current_palette = palettes[this_level];

	$scope.breadcrumbs = []; // Initialize breadcrumbs 
	$scope.showOthers = false;

	var budget = BudgetFactory.get(currentDocument).
		success(function(data, status, headers, config) {
		    // this callback will be called asynchronously
		    // when the response is available

		    pathMappings = getPathMappings(data);
		    console.debug("Path mappings: ", pathMappings);

		    rawFromCouch = data; 
		    console.debug("Data as stored in CouchDB: ",rawFromCouch);

		    // The drill function returns some raw data which
		    // is used within this controller to fullfil the
		    // features (chart data, further drill paths,
		    // information box summary data...).

		    rawFromDrill = drill(rawFromCouch,path);
		    console.log("Data as processed by drill: ",rawFromDrill);

		    $scope.budget_currency = rawFromCouch.root.currency ? rawFromCouch.root.currency.toUpperCase() : '';
		    $scope.currency_multiplier = rawFromCouch.root.multiplier ? rawFromCouch.root.multiplier : 1;

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
		'<p>' + int2roundKMG((parseFloat(y.value) * $scope.currency_multiplier).toString()) + '<br />' + $scope.budget_currency + '</p>';
	};

	$scope.barChartTooltips = function(key, x, y, e, graph) {
            return '<h3>' + x + '</h3>' +
		'<p>' + int2roundKMG(y) + '<br />' + $scope.budget_currency + '</p>';
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
	    $scope.nextPalette();
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
		    $scope.nextPalette();
		    
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
	    $scope.nextPalette();
	    process();
        };	


        $scope.LegendController = function($scope){
	    //NOOP
	    console.debug("FOO");

        };

	$scope.getLabels = function(args){

	    args = args ? args : ['Foo','Bar','Baz','Quux'];

	    console.debug("Just stoppin' by...");
	    return args;

	};

	$scope.getPalette = function (){
	    return $scope.current_palette;
	};

	$scope.colorFunction = function() {
	    return function(d, i) {
    		return $scope.current_palette[i];
	    };
	}

	$scope.nextPalette = function(){
	    var depth = -1;
	    var levels = path.split('.');

	    levels.forEach(function(step){
		if (step != 'categories'){
		    depth++;
		}
	    });

	    $scope.current_palette = palettes[depth];
	};


    }]);

