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
		"#9edae5", "#17becf", "#dbdb8d", "#bcbd22", "#c7c7c7", "#7f7f7f", "#f7b6d2", "#e377c2", "#c49c94", "#8c564b", "#c5b0d5", 
		"#9467bd", "#ff9896", "#d62728", "#98df8a", "#2ca02c", "#ffbb78", "#ff7f0e", "#aec7e8", "#1f77b4"
	    ],
	    [
		"#de9ed6", "#ce6dbd", "#a55194", "#7b4173", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#e7cb94", "#e7ba52", "#bd9e39", 
		"#8c6d31", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#9c9ede", "#6b6ecf", "#5254a3", "#393b79"
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
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + '<br />' + $scope.budget_currency + '</p>';
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

	    $scope.current_palette =  palettes[depth];
	};

	$scope.formatBarChartTicks = function () {
            return function(d) {
		return int2roundM(d.toString());
            }
	};


    }]);


// One-off charts controller
angular.module('pippDataApp.controllers.one-off-charts', ['ui.bootstrap', 'ngAnimate', 'legendDirectives'])
    .controller('oneOffChartsCtrl', ['$scope', '$location', '$routeParams', '$interval', function ($scope, $location, $routeParams, $interval) {

	// Pushed a brewer palette pair into the first two positions.
	// Otherwise, it's the nvd3 default 20 colour palette
	$scope.current_palette = 	    
	    [
		'#ef8a62', '#67a9cf', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', 
		'#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
	    ];

/*
	
	var vu_revenues = [[2011,12850.6],[2012,13612.4],[2013,14554.2],[2014,15252.7]];
	var vu_values   = [[2011,13840],[2012,14186.5],[2013,14184.2],[2014,14661.7]];

	$scope.vuRevenueExpenseHistory = [
	    {
		"key": "Revenues",
		"values": []
	    },
	    {
		"key": "Expenses",
		"values": []
	    }
   	];

	var this_item = 0;
	$interval(function(){
//	    console.debug(this_item.toString() + ': Adding ', vu_revenues[this_item]);
	    $scope.vuRevenueExpenseHistory[0].values.push(vu_revenues[this_item]);
	    $scope.vuRevenueExpenseHistory[1].values.push(vu_values[this_item]);
	    this_item++;
//	    console.debug('History: ', $scope.vuRevenueExpenseHistory);
	}, 200, vu_revenues.length);


	// Data series for the Vanuatu revenue/expense multi-line chart
*/

	$scope.vuRevenueExpenseHistory = [
	    {
		"key": "Revenues",
		"values": [[2010,12276],[2011,12850.6],[2012,13612.4],[2013,14554.2],[2014,15252.7]]         
	    },
	    {
		"key": "Expenses",
		"values": [[2010,13482],[2011,13840],[2012,14186.5],[2013,14184.2],[2014,14661.7]]         
	    }
   	];

	$scope.vuDebtHistory = [
	    {
		"key": "External Debt",
		"values": [[2011,10441.1],[2012,9702.2],[2013,9332.4],[2014,9249.1],[2015,11910],[2016,13639.1]]
	    },
	    {
		"key": "Domestic Debt",
		"values": [[2011,4234.9],[2012,5623.5],[2013,5929.8],[2014,5929.8],[2015,5929.8],[2016,5929.8]]
	    }
	];

	$scope.vuDonorVsGovt = [
	    {
		"key" : "Donor Aid",
		"values": [
		    ["MoH1",831280000],["MoE1",780723000],["MoE2",702623000],["MIPU",698969000],["MoH2",567094000],
		    ["Ports",510122000],["PMO",488499000],["TVET",333132000],["MFEM",237952000],["MoJ",237952000],
		    ["MoH3",232442000],["ICT",187470000],["MIA",172593000],["Meteo",157204000],["VTO",156988000],
		    ["MIA2",152289000],["MoH4",149000000],["Women",135176000],["Land",106412000],["Court",53376000],
		    ["Water",51021000],["MoH5",38499000],["Agri",25666000],["MIA3",22873000],["Commerce",20533000],
		    ["Agri2",19623000],["MoH6",16898000]
		]
	    },
	    {
		"key" : "Government Spending",
		"values": [
		    ["MoH1",792503017],["MoE1",24121329],["MoE2",661884190],["MIPU",421857218],["MoH2",139415181],
		    ["Ports",359808218],["PMO",83942974],["TVET",28110798],["MFEM",349711457],["MoJ",28979301],
		    ["MoH3",61055158],["ICT",280444229],["MIA",43487779],["Meteo",138811307],["VTO",23889013],
		    ["MIA2",201170506],["MoH4",303352323],["Women",36799825],["Land",8235498],["Court",82045610],
		    ["Water",17794398],["MoH5",49234561],["Agri",33909360],["MIA3",35316274],["Commerce",89162690],
		    ["Agri2",58117732],["MoH6",219418294]
		]
	    }
	];

	$scope.vuDonorsVsGovtLabels = [
	    "Ministry of Health, Hospital Services",
	    "Ministry of Education, Director General's Division",
	    "Technical and Higher Education Division",
	    "Public Works, Development and Maintainance of Government Infrastructure",
	    "Ministry of Health, Corporate Services",
	    "Shipping Services, Ports Administration",
	    "Prime Ministers Ministry Strategic Management",
	    "TVET and Employment Opportunties",
	    "Financial and Economic Management, Government Financial Services",
	    "Ministry of Justice, Corporate Services",
	    "Public Health Services",
	    "ICT Administration",
	    "Ministry of Internal Affairs, Administration of Regional Services",
	    "Weather Forecasting and Monitoring",
	    "Tourism Development", 
	    "Internal Security and Border Control, Joint Command and Control",
	    "Ministry of Health, Community Health Services",
	    "Woman's Affairs",
	    "Land Use Planning",
	    "Supreme Court",
	    "Rural Water Supply",
	    "Ministry of Education, Policy and Planning Division",
	    "Agriculture Policy and Administration",
	    "Ministry of Internal Affairs, Corporate Services",
	    "Executive Management Ministry of Commerce, Industry, Tourism and Ni-Vanuatu Business",
	    "Forestry",
	    "Medical Supplies Stock"
	];

	// return only integer values - this is needed to display years in the x axis
	$scope.xAxisTickFormatFunction = function(){
	    return function(d){
		if (d % 1 === 0){
		    return parseInt(d);
		}
	    };
	};

	// For the horizontal bar chart
	$scope.formatHBarChartTicks = function () {
            return function(d) {
		return int2roundM(d.toString());
            }
	};

	// Define which palette to use. See the note above about colour choices.
	$scope.colorFunction = function() {
	    return function(d, i) {
    		return $scope.current_palette[i];
	    };
	}

	$scope.lineChartTooltips = function(key, x, y, e, graph) {
            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + ' VATU<br />in ' + x + '</p>';
	};

	$scope.areaChartTooltips = function(key, x, y, e, graph) {
	    console.debug('E: ', e);
	    
            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000000).toString()) + ' VATU<br />in ' + x + '</p>';
	};

	$scope.stackedLineTooltips = function(key, x, y, e, graph) {

	    var label = '';
	    var total = 0;

	    if (typeof(e) != 'undefined'){
		var search_array = $scope.vuDonorVsGovt[e.seriesIndex].values;

		for (var i = 0; i < search_array.length; i++){
		    if (search_array[i][0] == x && search_array[i][1].toLocaleString('en') + '.0' == y){
			var other_index = e.seriesIndex === 0 ? 1 : 0;
			total = search_array[i][1] + $scope.vuDonorVsGovt[other_index].values[i][1];
//			console.debug("GOT IT: ", $scope.vuDonorsVsGovtLabels[i]);
			label = $scope.vuDonorsVsGovtLabels[i];
		    }
		}
	    }

	    label = label != '' ? label : x;
	    
            return '<h3>' + label + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + ' VATU<br /> in ' + key + '</p>' +
		'<p>(' + int2roundKMG((parseFloat(total)).toString()) + ' vatu in total)</p>';

	};


    }]);