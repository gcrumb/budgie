// Power generation charts controller
angular.module('pippDataApp.controllers.power-generation', ['ui.bootstrap', 'ngAnimate', 'legendDirectives'])
    .controller('powerGenerationCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {

	// We're actually using only the first three items in this array.
	$scope.current_palette = 	    
	    [
		'#ef8a62', '#67a9cf', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', 
		'#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
	    ];

	/* 

           ************************************************ 
        					 Power Consumption costs regionally
           ************************************************ 

	*/
	
	$scope.conversions = [
			{"Country":"Fiji","exchange":"50.44", "currency": "FJD"},
			{"Country":"Palau","exchange":"93.40", "currency": "USD"},
			{"Country":"American Samoa","exchange":"93.40", "currency": "USD"},
			{"Country":"Western Samoa","exchange":"40.16", "currency": "WST"},
			{"Country":"PNG","exchange":"38.29", "currency": "PGK"},
			{"Country":"New-Caledonia","exchange":"1.03", "currency": "CFP"},
			{"Country":"Kirbati","exchange":"87.80", "currency": "AUD"},
			{"Country":"Tuvalu","exchange":"87.80", "currency": "AUD"},
			{"Country":"Niue","exchange":"81.26", "currency": "NZD"},
			{"Country":"Nauru","exchange":"87.80", "currency": "AUD"},
			{"Country":"Marshall Islands","exchange":"93.40", "currency": "USD"},
			{"Country":"Solomon Islands","exchange":"13.08", "currency": "SBD"},
			{"Country":"Tonga","exchange":"50.44", "currency": "TOP"},
			{"Country":"Cook Islands","exchange":"81.26", "currency": "NZD"},
			{"Country":"Tahiti","exchange":"1.03", "currency": "CFP"},
			{"Country":"Vanuatu VUI LV","exchange":"1.00", "currency": "VUV"},
			{"Country":"Vanuatu UNELCO HV","exchange":"1.00", "currency": "VUV"},
			{"Country":"Vanuatu UNELCO LV","exchange":"1.00", "currency": "VUV"},
			{"Country":"Vanuatu VUI","exchange":"1.00", "currency": "VUV"},
			{"Country":"Vanuatu UNELCO","exchange":"1.00", "currency": "VUV"},
			{"Country":"FSM - Falalop","exchange":"93.40", "currency": "USD"},
			{"Country":"FSM - Kosrae","exchange":"93.40", "currency": "USD"},
			{"Country":"FSM - Chuck","exchange":"93.40", "currency": "USD"},
			{"Country":"FSM - Yap Island","exchange":"93.40", "currency": "USD"},
			{"Country":"Saipan","exchange":"93.40", "currency": "USD"},
			{"Country":"FSM - Pohnpei","exchange":"93.40", "currency": "USD"}
	];
				
	var power_consumption_ranking = [
	    {
					"graph": "Business Consumers",
					"series": [
							{"Country":"FSM - Pohnpei","Average bill 2014":"199572","Ranking 2014":"1","Ranking 2013":"1","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Fiji","Average bill 2014":"212418","Ranking 2014":"2","Ranking 2013":"2","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Nauru","Average bill 2014":"234854","Ranking 2014":"3","Ranking 2013":"3","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Guam","Average bill 2014":"260301","Ranking 2014":"4","Ranking 2013":"4","Tariff variation":"-0.08","Ranking evolution":"0"},
							{"Country":"New-Caledonia","Average bill 2014":"344051","Ranking 2014":"5","Ranking 2013":"5","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"American Samoa","Average bill 2014":"391197","Ranking 2014":"6","Ranking 2013":"6","Tariff variation":"0.03","Ranking evolution":"0"},
							{"Country":"Saipan","Average bill 2014":"410269","Ranking 2014":"7","Ranking 2013":"7","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"PNG","Average bill 2014":"416558","Ranking 2014":"8","Ranking 2013":"8","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Tonga","Average bill 2014":"462649","Ranking 2014":"9","Ranking 2013":"10","Tariff variation":"0.00","Ranking evolution":"1"},
							{"Country":"Marshall Islands","Average bill 2014":"473239","Ranking 2014":"10","Ranking 2013":"11","Tariff variation":"0.00","Ranking evolution":"1"},
							{"Country":"Tuvalu","Average bill 2014":"497364","Ranking 2014":"11","Ranking 2013":"12","Tariff variation":"-0.04","Ranking evolution":"1"},
							{"Country":"Western Samoa","Average bill 2014":"501523","Ranking 2014":"12","Ranking 2013":"9","Tariff variation":"0.10","Ranking evolution":"-3"},
							{"Country":"Vanuatu VUI HV","Average bill 2014":"503061","Ranking 2014":"13","Ranking 2013":"18","Tariff variation":"-0.12","Ranking evolution":"5"},
							{"Country":"FSM - Yap Island","Average bill 2014":"512749","Ranking 2014":"14","Ranking 2013":"13","Tariff variation":"0.00","Ranking evolution":"-1"},
							{"Country":"Average","Average bill 2014":"516437","Ranking 2014":"","Ranking 2013":"","Tariff variation":"-0.01","Ranking evolution":""},
							{"Country":"Tahiti","Average bill 2014":"557293","Ranking 2014":"15","Ranking 2013":"20","Tariff variation":"-0.03","Ranking evolution":"5"},
							{"Country":"Niue","Average bill 2014":"566775","Ranking 2014":"16","Ranking 2013":"14","Tariff variation":"0.00","Ranking evolution":"-2"},
							{"Country":"FSM - Chuck","Average bill 2014":"569492","Ranking 2014":"17","Ranking 2013":"15","Tariff variation":"0.05","Ranking evolution":"-2"},
							{"Country":"Palau","Average bill 2014":"575421","Ranking 2014":"18","Ranking 2013":"17","Tariff variation":"0.04","Ranking evolution":"-1"},
							{"Country":"Vanuatu VUI LV","Average bill 2014":"582015","Ranking 2014":"19","Ranking 2013":"22","Tariff variation":"-0.12","Ranking evolution":"3"},
							{"Country":"Vanuatu UNELCO HV","Average bill 2014":"583706","Ranking 2014":"20","Ranking 2013":"19","Tariff variation":"0.01","Ranking evolution":"-1"},
							{"Country":"FSM - Kosrae","Average bill 2014":"591558","Ranking 2014":"21","Ranking 2013":"16","Tariff variation":"0.09","Ranking evolution":"-5"},
							{"Country":"Vanuatu UNELCO LV","Average bill 2014":"657495","Ranking 2014":"22","Ranking 2013":"21","Tariff variation":"0.01","Ranking evolution":"-1"},
							{"Country":"Kiribati","Average bill 2014":"676029","Ranking 2014":"23","Ranking 2013":"23","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Cook Islands","Average bill 2014":"737628","Ranking 2014":"24","Ranking 2013":"24","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Solomon Islands","Average bill 2014":"887507","Ranking 2014":"25","Ranking 2013":"25","Tariff variation":"0.01","Ranking evolution":"0"},
							{"Country":"FSM - Falalop","Average bill 2014":"1022637","Ranking 2014":"26","Ranking 2013":"26","Tariff variation":"-0.08","Ranking evolution":"0"}
					]
	    },
	    {
					"graph": "Domestic Consumers",
					"series": [
							{"Country":"Nauru","Average bill 2014":"2818","Ranking 2014":"1","Ranking 2013":"1","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Fiji","Average bill 2014":"4440","Ranking 2014":"2","Ranking 2013":"2","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"FSM - Pohnpei","Average bill 2014":"4511","Ranking 2014":"3","Ranking 2013":"3","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Guam","Average bill 2014":"7822","Ranking 2014":"4","Ranking 2013":"4","Tariff variation":"-0.03","Ranking evolution":"0"},
							{"Country":"Saipan","Average bill 2014":"9712","Ranking 2014":"5","Ranking 2013":"6","Tariff variation":"-0.05","Ranking evolution":"1"},
							{"Country":"PNG","Average bill 2014":"10901","Ranking 2014":"6","Ranking 2013":"7","Tariff variation":"0.00","Ranking evolution":"1"},
							{"Country":"American Samoa","Average bill 2014":"11324","Ranking 2014":"7","Ranking 2013":"8","Tariff variation":"0.03","Ranking evolution":"1"},
							{"Country":"Palau","Average bill 2014":"11537","Ranking 2014":"8","Ranking 2013":"5","Tariff variation":"0.16","Ranking evolution":"-3"},
							{"Country":"Marshall Islands","Average bill 2014":"12415","Ranking 2014":"9","Ranking 2013":"9","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Tahiti","Average bill 2014":"12441","Ranking 2014":"10","Ranking 2013":"11","Tariff variation":"-0.01","Ranking evolution":"1"},
							{"Country":"FSM - Yap Island","Average bill 2014":"12596","Ranking 2014":"11","Ranking 2013":"10","Tariff variation":"0.00","Ranking evolution":"-1"},
							{"Country":"New-Caledonia","Average bill 2014":"12819","Ranking 2014":"12","Ranking 2013":"12","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Tuvalu","Average bill 2014":"12938","Ranking 2014":"13","Ranking 2013":"13","Tariff variation":"-0.04","Ranking evolution":"0"},
							{"Country":"Tonga","Average bill 2014":"13879","Ranking 2014":"14","Ranking 2013":"15","Tariff variation":"0.00","Ranking evolution":"1"},
							{"Country":"Average","Average bill 2014":"14494","Ranking 2014":"","Ranking 2013":"","Tariff variation":"0.05","Ranking evolution":""},
							{"Country":"Niue","Average bill 2014":"15033","Ranking 2014":"15","Ranking 2013":"16","Tariff variation":"0.00","Ranking evolution":"1"},
							{"Country":"Western Samoa","Average bill 2014":"15046","Ranking 2014":"16","Ranking 2013":"14","Tariff variation":"0.10","Ranking evolution":"-2"},
							{"Country":"Kiribati","Average bill 2014":"15935","Ranking 2014":"17","Ranking 2013":"19","Tariff variation":"0.00","Ranking evolution":"2"},
							{"Country":"FSM - Chuck","Average bill 2014":"16199","Ranking 2014":"18","Ranking 2013":"17","Tariff variation":"0.10","Ranking evolution":"-1"},
							{"Country":"FSM - Kosrae","Average bill 2014":"16798","Ranking 2014":"19","Ranking 2013":"18","Tariff variation":"0.10","Ranking evolution":"-1"},
							{"Country":"Vanuatu VUI","Average bill 2014":"16998","Ranking 2014":"20","Ranking 2013":"20","Tariff variation":"-0.12","Ranking evolution":"0"},
							{"Country":"Cook Islands","Average bill 2014":"20586","Ranking 2014":"21","Ranking 2013":"21","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Vanuatu UNELCO","Average bill 2014":"23319","Ranking 2014":"22","Ranking 2013":"22","Tariff variation":"0.01","Ranking evolution":"0"},
							{"Country":"Solomon Islands","Average bill 2014":"25435","Ranking 2014":"23","Ranking 2013":"23","Tariff variation":"0.05","Ranking evolution":"0"},
							{"Country":"FSM - Falalop","Average bill 2014":"30679","Ranking 2014":"24","Ranking 2013":"24","Tariff variation":"0.00","Ranking evolution":"0"}
					]
	    },
	    {
					"graph": "Small Domestic Consumers",
					"series": [
							{"Country":"Fiji","Average bill 2014":"520","Ranking 2014":"1","Ranking 2013":"1","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Nauru","Average bill 2014":"564","Ranking 2014":"2","Ranking 2013":"2","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Vanuatu VUI","Average bill 2014":"1207","Ranking 2014":"3","Ranking 2013":"5","Tariff variation":"-0.12","Ranking evolution":"2"},
							{"Country":"FSM - Pohnpei","Average bill 2014":"1216","Ranking 2014":"4","Ranking 2013":"4","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Vanuatu UNELCO","Average bill 2014":"1253","Ranking 2014":"5","Ranking 2013":"3","Tariff variation":"0.01","Ranking evolution":"-2"},
							{"Country":"Tuvalu","Average bill 2014":"1617","Ranking 2014":"6","Ranking 2013":"6","Tariff variation":"-0.07","Ranking evolution":"0"},
							{"Country":"Tahiti","Average bill 2014":"1819","Ranking 2014":"7","Ranking 2013":"7","Tariff variation":"-0.03","Ranking evolution":"0"},
							{"Country":"Palau","Average bill 2014":"2084","Ranking 2014":"8","Ranking 2013":"8","Tariff variation":"0.04","Ranking evolution":"0"},
							{"Country":"Kiribati","Average bill 2014":"2318","Ranking 2014":"9","Ranking 2013":"9","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"PNG","Average bill 2014":"2333","Ranking 2014":"10","Ranking 2013":"10","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Guam","Average bill 2014":"2386","Ranking 2014":"11","Ranking 2013":"11","Tariff variation":"0.01","Ranking evolution":"0"},
							{"Country":"Saipan","Average bill 2014":"2465","Ranking 2014":"12","Ranking 2013":"14","Tariff variation":"-0.06","Ranking evolution":"2"},
							{"Country":"FSM - Yap Island","Average bill 2014":"2481","Ranking 2014":"13","Ranking 2013":"12","Tariff variation":"0.00","Ranking evolution":"-1"},
							{"Country":"Marshall Islands","Average bill 2014":"2483","Ranking 2014":"14","Ranking 2013":"13","Tariff variation":"0.00","Ranking evolution":"-1"},
							{"Country":"Average","Average bill 2014":"2533","Ranking 2014":"","Ranking 2013":"","Tariff variation":"0.01","Ranking evolution":""},
							{"Country":"American Samoa","Average bill 2014":"2713","Ranking 2014":"15","Ranking 2013":"15","Tariff variation":"0.03","Ranking evolution":"0"},
							{"Country":"Tonga","Average bill 2014":"2776","Ranking 2014":"16","Ranking 2013":"17","Tariff variation":"0.00","Ranking evolution":"1"},
							{"Country":"Western Samoa","Average bill 2014":"2874","Ranking 2014":"17","Ranking 2013":"16","Tariff variation":"0.05","Ranking evolution":"-1"},
							{"Country":"Cook Islands","Average bill 2014":"3113","Ranking 2014":"18","Ranking 2013":"18","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"FSM - Kosrae","Average bill 2014":"3203","Ranking 2014":"19","Ranking 2013":"19","Tariff variation":"0.10","Ranking evolution":"0"},
							{"Country":"New-Caledonia","Average bill 2014":"3238","Ranking 2014":"20","Ranking 2013":"21","Tariff variation":"0.00","Ranking evolution":"1"},
							{"Country":"FSM - Chuck","Average bill 2014":"3240","Ranking 2014":"21","Ranking 2013":"20","Tariff variation":"0.10","Ranking evolution":"-1"},
							{"Country":"Niue","Average bill 2014":"3657","Ranking 2014":"22","Ranking 2013":"22","Tariff variation":"0.00","Ranking evolution":"0"},
							{"Country":"Solomon Islands","Average bill 2014":"5087","Ranking 2014":"23","Ranking 2013":"23","Tariff variation":"0.05","Ranking evolution":"0"},
							{"Country":"FSM - Falalop","Average bill 2014":"6136","Ranking 2014":"24","Ranking 2013":"24","Tariff variation":"0.00","Ranking evolution":"0"}
					]
	    }
	];

	$scope.getPowerData = function (series) {

			if (typeof series !== 'object'){
					return [];
			}

			if (typeof series[0].Country === 'undefined'){
					return [];
			}

			$scope.conversion_rate = $scope.conversion_rate ? $scope.conversion_rate : 1;

			var output = [];

//			console.debug('SERIES: ', JSON.stringify(series));

			series.forEach(function(item){
					output.push (
									[item.Country, (item['Average bill 2014'] / $scope.conversion_rate).toFixed(2)]
					);
			});
			console.debug ('OUTPUT: ', JSON.stringify([{"key":  power_consumption_ranking[$scope.whichPowerChart].graph, "values": output}]));
			return [{"key":  power_consumption_ranking[$scope.whichPowerChart].graph, "values": output}];
	};

	$scope.conversion_rate  = $scope.conversions[7].exchange;
	$scope.whichPowerChart  = 2;
	$scope.powerChartHeader = power_consumption_ranking[$scope.whichPowerChart].graph;
	$scope.powerChart       = $scope.getPowerData(power_consumption_ranking[$scope.whichPowerChart].series);
	$scope.get_currency     = function (conversion_rate){
			$scope.conversions.forEach(function(item){
					if (item.exchange === $scope.conversion_rate){
							return item.currency;
					}
			});
			return 'VUV';
	};
	$scope.currency        = $scope.get_currency($scope.conversion_rate);

	$scope.nextPowerChart = function(index){
	    if (typeof(index) === "number" && index >= 0 && index <= power_consumption_ranking.length){
					$scope.whichPowerChart = index;
	    }
	    else {
					$scope.whichPowerChart++;
	    }
	    $scope.vuPowerChartHeader = power_consumption_ranking[index].graph;
			$scope.powerChart         = $scope.getPowerData(power_consumption_ranking[index].series);
			
	};

	$scope.$watch('conversion_rate', function(newVal, oldVal){
			console.debug("UPDATE");
			$scope.powerChartHeader = power_consumption_ranking[$scope.whichPowerChart].graph;
			$scope.powerChart       = $scope.getPowerData(power_consumption_ranking[$scope.whichPowerChart].series);
			$scope.currency         = $scope.get_currency($scope.conversion_rate);
	});

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
					//i = i >= $scope.current_palette.length ? i - $scope.current_palette.length : i;
    			return $scope.current_palette[$scope.whichPowerChart];
	    };
	}

	/*

	  *****************
	  TOOLTIP FUNCTIONS
	  *****************

	 */

	$scope.powerTooltips = function(key, x, y, e, graph) {

//			console.debug(e);
	    var label = '';
	    var total = 0;

/*
	    if (typeof(e) != 'undefined'){
					var search_array = $scope.powerChart[e.seriesIndex].values;

					for (var i = 0; i < search_array.length; i++){
							if (search_array[i][0] == x && search_array[i][1].toLocaleString('en') + '.0' == y){
									var other_index = e.seriesIndex === 0 ? 1 : 0;
									total = search_array[i][1] + $scope.vuDonorVsGovt[other_index].values[i][1];
									if ($scope.whichPowerChart === 1){
											label = $scope.vuDonorsVsGovtLabels[i];
									}
							}
					}
	    }

	    label = label != '' ? label : x;
	    y = y.replace(/\.0/,"");
	    var all_commas = /,/g;
	    y = y.replace(all_commas,"");
*/
	    label = label != '' ? label : x;
			return '<h3>' + label + '</h3>' +
					'<p>' + y + ' VATU<br /> in 2014</p>';

	};

}]);
