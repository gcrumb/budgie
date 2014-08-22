'use strict';

/* Budget controller(s) */

angular.module('pippDataApp.controllers.budgets', ['ui.bootstrap', 'ngAnimate', 'legendDirectives'])
    .controller('BudgetCtrl', ['$scope', '$location', '$routeParams', 'BudgetFactory', function ($scope, $location, $routeParams, BudgetFactory) {

	var rawFromCouch = {}; // Keep the complete data set in frontend
	var rawFromDrill = {}; // Current mashed-up reduced data of interest
	var pathMappings = {}; // Convenient path mappings
	var path = 'root'; // Initialize path to root of budget data tree
	var drillableMappings = {"Other": true}; // Current drillable mappings
	var country = $scope.country ? $scope.country : $routeParams.country;

	var countries = {
	    'vu':  'Vanuatu',
	    'png': 'Papua New Guinea',
	    'tl':  'Timor Leste',
			'ki':  'Kiribati'
	};

	$scope.country_name = $scope.country_name ? $scope.country_name : countries[country];
	$scope.current_year = $scope.current_year ? $scope.current_year : $routeParams.year;

	console.debug("Current year" , $scope.current_year);
	// Don't want to cut the functionality just yet...
	$scope.showButtons = $routeParams.country ==='razzle-dazzle' ? true : false;
	$scope.currentDocument = $scope.currentDocument? $scope.currentDocument : country + '-' + $scope.current_year;

	// Use this for roll-up / unroll animations.
	var empty_pie = [{ 
        "label": "",
        "value" : 0
	}];

	var palettes = [
	    [
					'#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', 
					'#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'
	    ],
	    [
					'#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', 
					'#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'
	    ],
	    [
					'#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', 
					'#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
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

	var budget = BudgetFactory.get($scope.currentDocument).
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

		    rawFromDrill = drill(rawFromCouch,path, $scope.current_year);
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
			$scope.showPercentage = false;
			if ((country === 'ki') && typeof($scope.level) != 'undefined'){
					$scope.showPercentage = true;
					$scope.percentageHistory = getPercentageHistory(rawFromDrill.data);
			}

			if ($scope.breadcrumbs[$scope.breadcrumbs.length - 1] === $scope.name){
					$scope.historyLabel = $scope.breadcrumbs[$scope.breadcrumbs.length - 2];
			}
			else {
					$scope.historyLabel = $scope.breadcrumbs[$scope.breadcrumbs.length - 1];
			}

			if (typeof($scope.historyLabel) != 'undefined') {
					$scope.historyLabel.replace(/Spending/, '');
			}

	};

	$scope.tooltipContent = function(key, x, y, e, graph) {

	    var notes = '';
	    if (typeof($scope.notes) != 'undefined'){
		notes = '<p><em>' + $scope.notes + '</em></p>';
	    }

            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y.value) * $scope.currency_multiplier).toString()) + '<br />' + $scope.budget_currency + '</p>' +
		notes;
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
					rawFromDrill = drill(rawFromCouch,path,$scope.current_year);
	    }	    
	    $scope.nextPalette();
			
	    process();

  });

	$scope.radioModel =  'spending';

	// Handle the choice of spending, revenue or finance data
	//$scope.$on('recordSelect.directive', function (data){
	$scope.recordSelect = function (which){

	    $scope.radioModel = which;
	    $scope.currentDocument = country + '-' + $scope.current_year;
	    $scope.currentDocument = which !== 'spending' ? $scope.currentDocument + '-' + which : $scope.currentDocument;

	    var my_budget = BudgetFactory.get($scope.currentDocument).
		success(function(data, status, headers, config) {
		    pathMappings = getPathMappings(data);
		    path = 'root';
		    rawFromCouch = data; 

		    rawFromDrill = drill(rawFromCouch,path,$scope.current_year);
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
			rawFromDrill = drill(rawFromCouch, path, $scope.current_year);
			$scope.nextPalette();
			process();
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

	$scope.formatLineChartTicks = function () {
            return function(d) {
								return d % 1 === 0 ? d : '';
            }
	};


	$scope.percentageHistoryTooltips = function(key, x, y, e, graph) {
      return '<h3>' + $scope.name + '</h3>' +
					'<p>' + y + '% of Overall ' + $scope.historyLabel + ' Spending<br />' + 
					'in ' + x + '</p>';
	};

}]);

// One-off charts controller
angular.module('pippDataApp.controllers.one-off-charts', ['ui.bootstrap', 'ngAnimate', 'legendDirectives'])
    .controller('oneOffChartsCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {

	// Pushed a brewer palette pair into the first two positions.
	// Otherwise, it's the nvd3 default 20 colour palette
	$scope.current_palette = 	    
	    [
		'#ef8a62', '#67a9cf', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', 
		'#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
	    ];

	/* 

           ************************ 
					 Vanuatu graphs
           ************************ 

	*/
	
	$scope.vuUnbudgetedSpending = [
	    ["Government Scholarship Fund",298000000],
			["Creation of New Ministries", 53118826],
	    ["Central Payments",27700000],
	    ["MSG Contribution",22000000],
	    ["Grant to VTO",20000000],
	    ["Dept of Labour and Immigration",10000000],
	    ["Severance payment for DG Foreign Affairs",5000000],
	    ["Parliamentary Secretary",5000000],
	    ["Police Operations",4000000],
	    ["Department of Bio-security",3000000],
	    ["2017 Games Preparation",2000000],
	    ["Department Operation",1000000],
	    ["Ministry of Youth and Sport, Cabinet operational budget",1000000],
	    ["Ministry of Climate Change",1000000]
	];

	// Data series for the Vanuatu revenue/expense multi-line chart
	$scope.vuRevenueExpenseHistory = [
	    {
		"key": "Expenses",
		"values": [[2010,13482],[2011,13830],[2012,14186.5],[2013,14184.2],[2014,14661.7]]         
	    },
	    {
		"key": "Revenues",
		"values": [[2010,12276],[2011,12850.6],[2012,13612.4],[2013,14554.2],[2014,15252.7]]         
	    }
   	];

	// Data series for the Vanuatu revenue/expense multi-line chart
	$scope.vuDebtRepayments = [
	    {
		"key": "Interest Payments",
		"values": [[2011,398],[2012,463],[2013,555],[2014,597]]         
	    },
	    {
		"key": "Foreign Debt Repayments",
		"values": [[2011,307.2],[2012,335.1],[2013,465.18],[2014,591]]         
	    }
   	];

	// Data series for the Vanuatu debt chart
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

	var vu_donor_vs_govt_spending = [
	    {
					"graph": "Donor/Government Spending by Ministry",
					"series": [
							{
									"key" : "Donor Assistance",
									"values": [
											["Health",1796714],["Education",1854977],["Public Works",1260112],
											["Agriculture",45289],["Lands",106412],["Justice",426504],
											["PMO",675969],["Finance",237952],["Internal Affairs",347755],
											["Commerce",177521],["Meteo",157204],["Youth Dev.",333132]
									]
							},
							{
									"key" : "Government Spending",
									"values": [
											["Health",1642204],["Education",4177925],["Public Works",1546657],
											["Agriculture",482791],["Lands",231599],["Justice",52050],
											["PMO",1275492],["Finance",949330],["Internal Affairs",608452],
											["Commerce",113052],["Meteo",234984],["Youth Dev.",153551]
									]
							}
					]
	    },
	    {
					"graph": "Donor/Government Spending by Programme",
					"series": [ 
							{
									"key" : "Donor Assistance",
									"values": [
											["MoH1",831280],["MoE1",780723],["MoE2",702623],["MIPU",698969],["MoH2",567094],
											["Ports",510122],["PMO",488499],["TVET",333132],["MFEM",237952],["MoJ",237952],
											["MoH3",232442],["ICT",187470],["MIA",172593],["Meteo",157204],["VTO",156988],
											["MIA2",152289],["MoH4",149000],["Women",135176],["Land",106412],["Court",53376],
											["Water",51021],["MoH5",38499],["Agri",25666],["MIA3",22873],["Commerce",20533],
											["Agri2",19623],["MoH6",16898]
									]
							},
							{
									"key" : "Government Spending",
									"values": [
											["MoH1",792503],["MoE1",24121],["MoE2",661884],["MIPU",421857],["MoH2",139415],
											["Ports",359808],["PMO",83943],["TVET",28111],["MFEM",349711],["MoJ",28979],
											["MoH3",61055],["ICT",280444],["MIA",43488],["Meteo",138811],["VTO",23889],
											["MIA2",201170],["MoH4",303352],["Women",36799],["Land",8235],["Court",82046],
											["Water",17794],["MoH5",49234],["Agri",33909],["MIA3",35316],["Commerce",89163],
											["Agri2",58118],["MoH6",219418]
									]
							}
					]
	    }
	];

	$scope.whichDonorChart    = 0;
	$scope.vuDonorChartHeader = vu_donor_vs_govt_spending[$scope.whichDonorChart].graph;
	$scope.vuDonorVsGovt      = vu_donor_vs_govt_spending[$scope.whichDonorChart].series;

	$scope.nextDonorChart = function(index){
	    if (typeof(index) === "number" && index >= 0 && index <= vu_donor_vs_govt_spending.length){
		$scope.whichDonorChart = index;
	    }
	    else {
		$scope.whichDonorChart++;
	    }

	    $scope.whichDonorChart    = $scope.whichDonorChart >= vu_donor_vs_govt_spending.length ? 0 : $scope.whichDonorChart;
	    $scope.vuDonorVsGovt      =  vu_donor_vs_govt_spending[$scope.whichDonorChart].series;
	    $scope.vuDonorChartHeader = vu_donor_vs_govt_spending[$scope.whichDonorChart].graph;

	};
	
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

	$scope.vuGDP = [
	    {
		"key": "GDP",
		"values": [
		    [2010,1.6],[2011,1.2],[2012,1.8],[2013,3.3],[2014,5.1],[2015,5.9]
		]
	    },
	    {
		"key": "Ag/Fish/Forestry",
		"values": [
		    [2010,4.8],[2011,6.1],[2012,2.2],[2013,1.3],[2014,1.7],[2015,2.5]
		]
	    },
	    {
		"key": "Industry/Construction",
		"values": [
		    [2010,12.6],[2011,-19.4],[2012,-22.1],[2013,0.5],[2014,11.1],[2015,29.8]
		]
	    },
	    {
		"key": "Services",
		"values": [
		    [2010,3.0],[2011,3.2],[2012,4.4],[2013,4.1],[2014,5.4],[2015,5.4]
		]
	    }
	];

	$scope.vuScholarshipOverspend = [
	    {
		"key": "Scholarship Budget",
		values: [
		    [2012,270],[2013,270],[2014,460]
		]
	    },
	    {
		"key": "Overspend",
		values: [
		    [2012,137],[2013,339],[2014,318]
		]
	    }
	];

	$scope.vuSpendingByCategory = [
	    {
					"key": "Scholarship spending",
					"values":[
							["Scholarships",778]
					]
	    },
	    {
					"key": "2014 Budget by Selected Category",
					"values":[
							["Hospital Services",792],["Min. Internal Affairs",608],
							["Min. Agriculture",482],["Min. Foreign Affairs",366],["Min. Trade",287],
							["Min. Lands",231],["Medical Supplies",219]
					]
	    }
	];

	var vu_education_trends = [
	    {
		"graph": "Average Drop Out Rate",
		"series": [
		    {
		    "key": "Primary (Year 1-6)",
		    "values": [[2008,7],[2009,2],[2010,6],[2011,8],[2012,4]]
		    },
		    {
		    "key": "Secondary (Year 7-13)",
		    "values": [[2008,27],[2009,38],[2010,40],[2011,44],[2012,34]]
		    }
		]		
	    },
	    {
		"graph": "Average Repetition Rate",
		"series": [
		    {
		    "key": "Primary (Year 1-6)",
		    "values": [[2008,14],[2009,14],[2010,15],[2011,12],[2012,15]]
		    },
		    {
		    "key": "Secondary (Year 7-13)",
		    "values": [[2008,2],[2009,2],[2010,3],[2011,3],[2012,3]]
		    }
		]		
	    },
	    {
		"graph": "Survival to Year 13",
		"series": [
		    {
		    "key": "Secondary",
		    "values": [[2008,20],[2009,16],[2010,10],[2011,7],[2012,12]]
		    }
		]		
	    }
	];

	$scope.whichEducationGraph = 0;
	$scope.vuEducationGraphHeader = vu_education_trends[$scope.whichEducationGraph].graph;
	$scope.vuEducationGraph =  vu_education_trends[$scope.whichEducationGraph].series;

	$scope.nextEducationGraph = function(index){
	    if (typeof(index) === "number" && index >= 0 && index <= vu_education_trends.length){
		$scope.whichEducationGraph = index;
	    }
	    else {
		$scope.whichEducationGraph++;
	    }

	    $scope.whichEducationGraph = $scope.whichEducationGraph >= vu_education_trends.length ? 0 : $scope.whichEducationGraph;
	    $scope.vuEducationGraph =  vu_education_trends[$scope.whichEducationGraph].series;
	    $scope.vuEducationGraphHeader = vu_education_trends[$scope.whichEducationGraph].graph;

	};

	/* 

           ************************ 
	   Papua New Guinea graphs
           ************************ 

	*/

	$scope.pngSpendingVSRevenue = [
	    {
		"key" : "Growth in Spending",
		"values": [
		    [2013,21],[2014,14],[2015,2],[2016,4],[2017,5],[2018,6]
		]
	    },
	    {
		"key" : "Growth in Tax Revenue",
		"values": [
		    [2013,6],[2014,13],[2015,9],[2016,14],[2017,9],[2018,9]
		]
	    }
	];

	$scope.pngDeficit = [
	    {
		"key": "Deficit",
		"values": [
		    [2013,-2737],[2014,-2353],[2015,-1315],[2016,-1206.4],[2017,-1068.2],[2018,-1134.4]
		]
	    }				
	];

	$scope.pngDebt = [
	    {
		"key": "Fiscal Responsibility Line",
		"values": [
		    [2012,35],[2013,35],[2014,35],[2015,35],[2016,35]
		]
	    },
	    {
		"key": "Debt Load",
		"values": [
		    [2012,26.4],[2013,33.5],[2014,35.2],[2015,29.3],[2016,29.9]
		]
	    }	
	];

	$scope.pngBorrowing = [
	    {
		"key": "Borrowing",
		"values": [
		    [2012,161.9],[2013,482.1],[2014,647.8],[2015,445.9],[2016,297.1],[2017,182.1],[2018,21.2]
		]
	    }				

	];

	$scope.pngGDP = [
	    {
		"key": "Ag/Forests/Fish",
		"values": [
		    [2012,-0.5],[2013,0.2],[2014,1.3],[2015,1.3],[2016,0.9]
		]
	    },
	    {
		"key": "Oil & Gas",
		"values": [
		    [2012,-0.3],[2013,0],[2014,4],[2015,17.2],[2016,0]
		]
	    },
	    {
		"key": "Mining",
		"values": [
		    [2012,-0.1],[2013,0.7],[2014,0.7],[2015,0.2],[2016,0]
		]
	    },
	    {
		"key": "Manufacturing",
		"values": [
		    [2012,0.9],[2013,0.3],[2014,0.3],[2015,0.4],[2016,0.3]
		]
	    },
	    {
		"key": "Utilities",
		"values": [
		    [2012,0.1],[2013,0.1],[2014,0.1],[2015,0.1],[2016,0.1]
		]
	    },
	    {
		"key": "Construction",
		"values": [
		    [2012,4.6],[2013,2.6],[2014,-1.5],[2015,0.8],[2016,0.4]
		]
	    },
	    {
		"key": "Wholesale/Retail",
		"values": [
		    [2012,1.7],[2013,0.5],[2014,0.4],[2015,0.5],[2016,0.4]
		]
	    },
	    {
		"key": "Transport/Communications",
		"values": [
		    [2012,1],[2013,0.3],[2014,0.3],[2015,0.3],[2016,0.3]
		]
	    },
	    {
		"key": "Finance/Real Estate",
		"values": [
		    [2012,0.5],[2013,0.3],[2014,0.2],[2015,0.2],[2016,0.2]
		]
	    },
	    {
		"key": "Social/Personal Services",
		"values": [
		    [2012,0.2],[2013,0.6],[2014,0.4],[2015,0.3],[2016,0.3]
		]
	    }
	]

	$scope.pngExports = [
	    {
		"key": "Mineral Exports",
		"values": [
		    [2012,10203.7],[2013,9954.6],[2014,12343.8],[2015,22796.7],[2016,23598.7]
		]
	    },
	    {
		"key": "Ag/Forest/Fish Exports",
		"values": [
		    [2012,2970.9],[2013,2453.8],[2014,2534.1],[2015,2742.5],[2016,2635.1]
		]
	    }
	];

	var pngUpdatedFinancials = [
			{
					"graph": "2014 Budget",
					"series": [
							{
									"key": "Total Revenue & Grants",
									"values": [[2013,9832.7],[2014,12688.5]]
							},
							{
									"key": "Spending and Net Lending",
									"values": [[2013,12505.1],[2014,15041.5]]
							},
							{
									"key": "Revised Revenue Estimate",
									"values": [[2013,9832.7],[2014,12316.0]]
							}
					]		
	    },
			{
					"graph": "2014 Revised",
					"series": [
							{
									"key": "Total Revenue & Grants",
									"values": [[2013,9832.7],[2014,12316.0]]
							},
							{
									"key": "Spending and Net Lending",
									"values": [[2013,12505.1],[2014,15041.5]]
							}
					]		
	    }	
	];

	$scope.whichPNGFinancials = 0;
	$scope.pngUpdateHeader = pngUpdatedFinancials[$scope.whichPNGFinancials].graph;
	$scope.pngUpdateGraph  = pngUpdatedFinancials[$scope.whichPNGFinancials].series;

	$scope.nextPNGFinancial = function(index){
	    if (typeof(index) === "number" && index >= 0 && index <= pngUpdatedFinancials.length){
					$scope.whichPNGFinancials = index;
	    }
	    else {
					$scope.whichPNGFinancials++;
	    }

	    $scope.whichPNGFinancials = $scope.whichPNGFinancials >= pngUpdatedFinancials.length ? 0 : $scope.whichPNGFinancials;
	    $scope.pngUpdateGraph     = pngUpdatedFinancials[$scope.whichPNGFinancials].series;
	    $scope.pngUpdateHeader    = pngUpdatedFinancials[$scope.whichPNGFinancials].graph;

	};

	$scope.pngDebtUpdate = [
			{
					"key" : "2014 Budgeted",
					"values" :	[[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-2353.0],[2015,-1315.0],[2016,-1206.4]]
			},
			{
					"key" : "2014 Revised",
					"values" :[[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-2725.0],[2015,-1315.0],[2016,-1206.4]]
			},
			{
					"key" : "2014 Revised*",
					"values" : [[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-3612.0],[2015,-1315.0],[2016,-1206.4]]
			}
	];

/*
	var pngDebtUpdate = [
			{
					graph: "2014 Original Forecast",
					series: [
							{
									"key" : "2014 Budgeted",
									"values" :	[[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-2353.0],[2015,-1315.0],[2016,-1206.4]]
							}
					]
			},
			{
					graph: "2014 Revised",
					series: [
							{
									"key" : "2014 Revised",
									"values" :[[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-2725.0],[2015,-1315.0],[2016,-1206.4]]
							}
					]
			},
			{
					graph: "2014 Revised*",
					series: [
							{
									"key" : "2014 Revised*",
									"values" : [[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-3612.0],[2015,-1315.0],[2016,-1206.4]]
							}
					]
			}
	];
*/
	var pngDebtUpdate = [
			{
					graph: "2014 Original Forecast",
					series: [
							{
									"key" : "2014 Budgeted",
									"values" :	[[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-2353.0]]
							}
					]
			},
			{
					graph: "2014 Revised",
					series: [
							{
									"key" : "2014 Revised",
									"values" :[[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-2725.0]]
							}
					]
			},
			{
					graph: "2014 Revised*",
					series: [
							{
									"key" : "2014 Revised*",
									"values" : [[2011,-65.7],[2012,-480.9],[2013,-2672.4],[2014,-3612.0]]
							}
					]
			}
	];

	$scope.debtColours = function (){
	    return function(d, i) {
					var severity = ['FAB1B1', 'D17D8B', 'A3152D'];
					return severity[$scope.whichPNGDebt];
	    };
	};

	$scope.whichPNGDebt = 0;
	$scope.pngDebtHeader = pngDebtUpdate[$scope.whichPNGDebt].graph;
	$scope.pngDebtGraph  = pngDebtUpdate[$scope.whichPNGDebt].series;

	$scope.nextPNGDebt = function(index){
	    if (typeof(index) === "number" && index >= 0 && index <= pngDebtUpdate.length){
					$scope.whichPNGDebt = index;
	    }
	    else {
					$scope.whichPNGDebt++;
	    }

	    $scope.whichPNGDebt = $scope.whichPNGDebt >= pngDebtUpdate.length ? 0 : $scope.whichPNGDebt;
	    $scope.pngDebtGraph     = pngDebtUpdate[$scope.whichPNGDebt].series;
	    $scope.pngDebtHeader    = pngDebtUpdate[$scope.whichPNGDebt].graph;

	};

	/*

	  *****************
	  UTILITY FUNCTIONS
	  *****************

	 */

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

	/*

	  *****************
	  TOOLTIP FUNCTIONS
	  *****************

	 */

	$scope.lineChartTooltips = function(key, x, y, e, graph) {

	    var other_index = e.seriesIndex === 0 ? 1 : 0;
	    var index = x - 2010; // Yep, magic number :-/

	    var gap = $scope.vuRevenueExpenseHistory[1].values[index][1] - $scope.vuRevenueExpenseHistory[0].values[index][1];
	    
	    var spending_status = gap < 0 ? 'deficit' : 'surplus';

            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + ' VATU<br />in ' + x + '</p>' +
		'<p>(' + int2roundKMG((gap  * 1000000).toString().replace('-', '')) + ' vatu ' + spending_status + ')</p>';
	};

	$scope.pngUpdateTooltips = function(key, x, y, e, graph) {

	    var other_index = e.seriesIndex === 0 ? 1 : 0;
	    var index = x - 2011; // Yep, magic number :-/

	    var gap = pngDebtUpdate[0].series[0].values[index][1] - pngDebtUpdate[$scope.whichPNGDebt].series[0].values[index][1];

	    if (gap === 0){

					var divergence = $scope.whichPNGDebt === 0 ? '' : '<p>( No change from the original estimate)</p>';

          return '<h3>' + x + ' Deficit</h3>' +
							'<p>' + int2roundKMG((parseFloat(y.replace(/,/g,'')) * 1000000).toString()) + ' KINA<br />in ' + x + '</p>' +
							divergence;
			}

	    var spending_status = gap > 0 ? 'increase' : 'reduction';

      return '<h3>' + x + ' Deficit</h3>' +
					'<p>' + int2roundKMG((parseFloat(y.replace(/,/g,'')) * 1000000).toString().replace('-','')) + ' KINA<br />in ' + x + '</p>' +
					'<p>(' + int2roundKMG((gap  * 1000000).toString().replace('-', '')) + ' kina ' + spending_status + ' from the original estimate)</p>';

	};

	$scope.overspendChartTooltips = function(key, x, y, e, graph) {

	    var index = x - 2012; // Yep, magic number :-/
	    var percent_overspend = parseFloat($scope.vuScholarshipOverspend[1].values[index][1] / $scope.vuScholarshipOverspend[0].values[index][1] * 100).toFixed(2);

            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + ' VATU<br />in ' + x + '</p>' +
		'<p>(' + percent_overspend + '%'   + ' overspent)</p>';
	};


	$scope.lineChartTooltipsGDP = function(key, x, y, e, graph) {
            return '<h3>' + key + '</h3>' +
		'<p>' + y + '% points<br />in ' + x + '</p>';
	};

	$scope.lineChartTooltipsDebtGDP = function(key, x, y, e, graph) {
            return '<h3>' + key + '</h3>' +
		'<p>' + y + '% of GDP<br />in ' + x + '</p>';
	};

	$scope.lineChartTooltipsEducation = function(key, x, y, e, graph) {
      return '<h3>' + key + '</h3>' +
					'<p>' + y + '%<br />in ' + x + '</p>';
	};

	$scope.areaChartTooltips = function(key, x, y, e, graph) {
            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000000).toString()) + ' VATU<br />in ' + x + '</p>';
	};

	$scope.vuSelectedCategoryTooltips = function(key, x, y, e, graph) {
	    var label = x;
	    label = label.replace(/Min\./, "Ministry of");
            return '<h3>' + label + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + ' VATU<br /></p>';
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
			if ($scope.whichDonorChart === 1){
			    label = $scope.vuDonorsVsGovtLabels[i];
			}
		    }
		}
	    }

	    label = label != '' ? label : x;
	    y = y.replace(/\.0/,"");
	    var all_commas = /,/g;
	    y = y.replace(all_commas,"");
	    
            return '<h3>' + label + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000).toString()) + ' VATU<br /> in ' + key + '</p>' +
		'<p>(' + int2roundKMG((parseFloat(total) * 1000).toString()) + ' vatu in total)</p>';

	};

	$scope.debtRepaymentTooltips = function(key, x, y, e, graph) {
	    return '<h3>' + x + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + ' VATU<br /> in ' + key + '</p>';
	};

	$scope.pieTooltips = function(key, x, y, e, graph) {
            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG(parseFloat(y.value).toString()) + '<br />VATU</p>';
	};

	$scope.pngDeficitTooltips = function(key, x, y, e, graph) {

	    // Handle negatives.
	    var minus = y.indexOf('-') === 0 ? '-' : '';
	    var amount = y.toString().replace(/\-/,"");
	    amount = amount.replace(/,/g,"");

            return '<h3>' + key + '</h3>' +
		'<p>' + minus + int2roundKMG((parseFloat(amount) * 1000000).toString()) + ' KINA<br />in ' + x + '</p>';

	};

	$scope.pngBorrowingTooltips = function(key, x, y, e, graph) {
            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y) * 1000000).toString()) + ' KINA<br />in ' + x + '</p>';
	};

}]);


angular.module('pippDataApp.controllers.npps', ['ui.bootstrap', 'ngAnimate'])
    .controller('NPPCtrl', ['$scope', '$location', '$routeParams', 'BudgetFactory', function ($scope, $location, $routeParams, BudgetFactory) {

	var rawFromCouch = {}; // Keep the complete data set in frontend
	var rawFromDrill = {}; // Current mashed-up reduced data of interest
	var pathMappings = {}; // Convenient path mappings
	var path = 'root'; // Initialize path to root of budget data tree

	$scope.current_year = $routeParams.year ? $routeParams.year : 2014;
	var currentDocument = 'vu-npps-' + $scope.current_year.toString();

	$scope.vuNPPs              = [];
	$scope.budget_currency     = 'VATU';
	$scope.currency_multiplier = 1;
	$scope.annual_total        = '';

	var palettes = [
	    [
		'#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', 
		'#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'
	    ],
	    [
		'#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', 
		'#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'
	    ],
	    [
		'#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', 
		'#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
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

	$scope.current_palette     = palettes[parseFloat($scope.current_year) - 2012];

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

		    rawFromDrill = drill(rawFromCouch,path,$scope.current_year);
		    console.log("Data as processed by drill: ",rawFromDrill);
		    $scope.annual_total = int2roundKMG(rawFromDrill['data'][$scope.current_year]['aggr'].toString());
		    process();

		}).
		error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});

	var process = function () {
	    
	    // Pie chart side
	    $scope.name = rawFromDrill.name;
	    $scope.level = rawFromDrill.level;
	    console.log("Pie Data:", getPieChartData(rawFromDrill.categories));

	    var pie = getPieChartData(rawFromDrill.categories);

	    if (path === 'root'){
		$scope.pieChartData = pie;
	    }
	    else {
		$scope.vuNPPs = pie;
	    }
	};

	$scope.tooltipContent = function(key, x, y, e, graph) {
            return '<h3>' + key + '</h3>' +
		'<p>' + int2roundKMG((parseFloat(y.value) * $scope.currency_multiplier).toString()) + '<br />' + $scope.budget_currency + '</p>' +
		'<p><em>(Click for full listing)</em></p>';
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

        $scope.$on('elementClick.directive', function(event,data){
	    
	    path = pathMappings[data.label];
	    rawFromDrill = drill(rawFromCouch,path,$scope.current_year);
	    process();
	    
        });

	$scope.radioModel =  $scope.current_year.toString();

	$scope.recordSelect = function (which){

	    $scope.vuNPPs = [];
	    $scope.radioModel = which.toString();
	    console.debug('Current year: ', $scope.radioModel);

	    currentDocument = 'vu-npps-' + $scope.radioModel;

	    var my_budget = BudgetFactory.get(currentDocument).
		success(function(data, status, headers, config) {
		    $scope.current_year    = which.toString();
		    $scope.current_palette = palettes[parseFloat($scope.current_year) - 2012];
		    pathMappings           = getPathMappings(data);
		    path                   = 'root';
		    rawFromCouch           = data; 

		    rawFromDrill = drill(rawFromCouch,path,$scope.current_year);
		    console.debug("RAW: ", rawFromDrill);
		    $scope.annual_total = int2roundKMG(rawFromDrill['data'][$scope.current_year]['aggr'].toString());
		    process();

		}).
		error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});

	};

	$scope.colorFunction = function() {
	    return function(d, i) {
    		return $scope.current_palette[i];
	    };
	}

	$scope.int2roundKMG = function(y){
	    return int2roundKMG(y.toString());
	};

    }]);

angular.module('pippDataApp.controllers.budget-timeline', ['ui.bootstrap', 'ngAnimate'])
    .controller('budgetTimeline', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {

	$scope.width  = '100%';
	$scope.height = '600';
	
	$scope.timelineData = {
	    "timeline":
	    {
		"headline":"Vanuatu Budget Timeline",
		"type":"default",
		"text":"<p>The budget-making process goes on year-round, with numerous important activities coming together to build this important document...</p>",
		"date": [
		    {
						"startDate":"2014,04,15",
			"endDate":"2014,04,26",
			"headline":"Budget Policy Statement",
			"text":"<p>Budget Policy Statement is submitted to Minister and Director General of Finance and then " + 
								'<a href="http://www.doft.gov.vu/index.php/widgetkit/budget-policy-statements">published</a>.' +
								" <em>The release of this document should give an insight into the government’s key priorities for the coming year.</em></p>",
						"tag":"Finance Dept."
		    },
		    {
			"startDate":"2014,04,29",
			"endDate":"2014,04,29",
			"headline":"Donor Consultations",
			"text":"<p>Government officials meet with donors to confer on policy priorities, providing an opportunity to align and better coordinate their work." +
			    " A dialogue between the government and donors should begin to align priorities. In practice this process does not take place.</p>",
			"tag":"Donors"
		    },
		    {
			"startDate":"2014,05,13",
			"endDate":"2014,05,17",
			"headline":"Ministry Ceilings Established",
			"text":"<p>2014 Ministry budget ceilings are approved by the Ministerial Budget Committee and then the Council Of Ministers." +
			    " In practice Vanuatu sees little movement in budget ceilings.</p>" +
			    "<p>Using the established budget ceilings individual ministries submit their preliminary budget submissions to the ministry of finance " +
			    "They also consider whether they wish to bid for <a href='/?page_id=574'>New Policy Proposals</a>" +
			    " - new pots of money to fund ministerial programs and initiatives.</p>",
			"tag":"Council of Ministers"
		    },
		    {
			"startDate":"2014,6,28",
			"endDate":"2014,6,28",
			"headline":"Ministry Budget Submissions",
			"text":"<p>Ministers and directors general submit 2014 budget submissions to department of finance." +
			    " <em>This is the deadline for submission of full ministerial budgets and suggestions for New Policy Proposals.</em></p>", 
			"tag":"Finance Dept."
		    },
		    {
			"startDate":"2014,6,28",
			"endDate":"2014,6,28",
			"headline":"Expenditure Report Regulation 2.1",
			"text":"<p>It is a regulatory requirement that the Vanuatu government makes an assessment of budget performance and that " +
			    "ministries and constitutional agencies are adhering to financial regulations." +
			    "The director general of the ministry of finance and economic management submits this report to the public service commission.</p>", 
			"tag":"Finance Dept."
		    },
		    {
			"startDate":"2014,07,31",
			"endDate":"2014,07,31",
			"headline":"HALF YEAR ECONOMIC AND FISCAL UPDATE",
			"text":"<p>The department of finance publishes its " +
								'<a href="http://www.doft.gov.vu/index.php/administration-finance-treasury/half-yearly-economic-and-fiscal-report">updated budget position</a>' +
								", adjusting the current year's budget as necessary in order to " +
								" reflect progress during the first six months of the year." +
								" This is an assessment of the economy and budget is performing over the first half of the year. " + 
								"Essentially, this is a way of making sure things are on track for the current budget.</p>",
			"tag":"Finance Dept."
		    },
		    {
			"startDate":"2014,08,19",
			"endDate":"2014,08,23",
			"headline":"Donor Consultations",
			"text":"<p>Government and donors meet again to finalise their spending plans for the coming year." +
			    "Donors respond to the government with projects they are willing to fund which match the government’s policy priorities. " + 
			    "Again this process often does not take place as planned.</p>",
			"tag":"Donors"
		    },
		    {
			"startDate":"2014,08,26",
			"endDate":"2014,08,30",
			"headline":"Ministerial Budget Committee Hearings",
			"text": "<p>Ministerial Budget Committee (or MBC) hearings are when each individual constitutional agency and ministry have the opportunity " +
			    "to present their budgets for the following year to MBC members and make their cases for extra funding. " +
			    "Following the presentation MBC members question them.</p>" +
			    "<p>The Ministerial Budget Committee then meets to consider the final draft of the budget estimates for 2015.</p>" +
			    " <p>While aiming for a fiscally prudent budget (often for a balanced one in Vanuatu's case), " +
			    " the MBC begins discussions of those <a href='/?page_id=57'>New Policy Proposals</a> to be undertaken in next year’s budget.</p>",
			"tag":"Council of Ministers"
		    },
		    {
			"startDate":"2014,08,26",
			"endDate":"2014,08,30",
			"headline":"Submission to Council of Ministers",
			"text":"<p>The finalised 2015 budget is submitted to the Council of Ministers</p>" +
			    " The chairman of the Ministerial Budget Committee asks the rest of the Council of Ministers to approve proposed budget.</p>",
			"tag":"Council of Ministers"
		    },
		    {
			"startDate":"2014,08,26",
			"endDate":"2014,08,30",
			"headline":"Appropriation Bill Drafted",
			"text":"<p>The budget is passed to the State Law Office in order that the 2015 Appropriation Bill can be prepared.</p>",
			"tag":"Finance Dept."
		    },
		    {
			"startDate":"2014,09,2",
			"endDate":"2014,09,2",
			"headline":"Bill passed to MPs",
			"text":"<p>The finished 2015 Appropriation Bill is circulated to members of parliament. " +
			    " Ministers and members of parliament are given a month to scrutinise the numbers.</p>",
			"tag":"Parliament"
		    },
		    {
			"startDate":"2014,09,23",
			"endDate":"2014,10,2",
			"headline":"Budget Books Prepared",
			"text":"<p>The budget books, which explain in detail the financial plans of the government, are prepared in both French and English. " +
			    " The three volumes include the <a href='/?page_id=28'>fiscal strategy report</a>, " +
			    " a detailed list of <a href='/?page_id=98'>budget appropriations/estimates</a>, and the budget narrative.</p>",
			"tag":"Finance Dept."
		    },
		    {
			"startDate":"2014,10,14",
			"endDate":"2014,10,18",
			"headline":"Budget Books Distributed",
			"text":"<p>The printed budget books are circulated to members of parliament." +
			    " This provides ample time for members to scrutinise the documents before the next parliamentary session begins.</p>",
			"tag":"Parliament"
		    },
		    {
			"startDate":"2014,12,2",
			"endDate":"2014,12,15",
			"headline":"Parliament Sits",
			"text":"<p>Parliamentary debate and scrutiny over the budget takes place before the appropriation bills are voted into law.",
			"tag":"Parliament"
		    }
		],
		"era": [
		    {
			"startDate":"2014,1,1",
			"endDate":"2014,12,31",
			"headline":"Vanuatu's financial year is the same as the calendar year",
			"tag":"FINANCIAL YEAR"
		    }
		    
		]
		
	    }
	};

	$scope.newTimeline = function (){
	    createStoryJS({
					type: 'timeline',
					embed_id: 'budgetTimeline',
					width: $scope.width,
					height: $scope.height,
					source: $scope.timelineData,
					font: "Helvetica"
	    });
	};
				
	$scope.newTimeline();

}]);
