/**
 * @license GPLv2
 * (c) 2013-2014 Nasara Holdings.
 * License:     This file is part of Budgie.

    Budgie is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    Budgie is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Budgie.  If not, see <http://www.gnu.org/licenses/>.

***** */

'use strict';

/**
 * @description
 *
 * This drill function takes the full model and the path to the area
 * of interest in the deeply nested budget model and returns the
 * necessary data to draw the chart, summary text and previous year's
 * bar chart data along with convenient flags indicating where further
 * drilling can and cannot be done.
 *
 * For example, let's say you are within the highest level (i.e the
 * Departmental Expenditure) looking at the departments distribution
 * in the donut (i.e. Department of Health, Department of
 * Education...) and you click on Department of Health to drill down
 * further. This drill function would take the following arguments:
 * 
 * @param {Object} budget Object the full yearly budget model for a
 * given Pacific country
 * 
 * @param {String} path String representing the path to the are of
 * interest. For example, 'root.categories.depart-health'
 */
var drill = function (budget, path, current_year) {

    // Work on a copy of the data to not mutate original.
    var budget_copy = JSON.parse(JSON.stringify(budget));

    // Extract budget segment of interest in its raw form. This will
    // contain all raw data from point of interest all the way up the
    // tree.
    var budget_segment = _.deep(budget_copy,path);

		//console.debug('Budget segment: ', budget_segment);

    // Go through categories of this segment of interest, mash-up data
    // in a convenient way for use in controller: only include name,
    // current data and a boolean drillable flag.

    var raw_categories = budget_segment.categories;
    var categories = [];

    for (var category in raw_categories) {
				// cat is a local variable to hold the newly mashed-up data
				// for a given category. It will populate the categories
				// variable above
				var cat = {}; 
				cat['name'] = raw_categories[category].name;
				cat['notes'] = raw_categories[category].notes;
				
				cat['current-data'] = raw_categories[category]['data'][current_year];
				cat['level'] = raw_categories[category].level;
				if (_.has(raw_categories[category], "categories")) {
						cat['drillable'] = true;
				} else {
						cat['drillable'] = false;
				}

				categories.push(cat);
    }

    categories.sort(sort_categories);

    // Replace raw categories with only the necessary information to
    // draw the view. In other words, all data further up the tree
    // that is not needed will not be included. The mashed-up
    // categories above will be set instead of the raw categories
    // (which may or may not contain an arbitrary number of data
    // further up the tree)
    return _.deep(budget_segment, 'categories', categories);

};

var sort_categories = function (a,b){

    if (parseFloat(a['current-data']['aggr']) < parseFloat(b['current-data']['aggr'])){
				return 1;
    }
    if (parseFloat(a['current-data']['aggr']) == parseFloat(b['current-data']['aggr'])){
				return 0;
    }

    return -1;    
}


/**
 * @description
 *
 * This utility function is used mash-up data from model into D3 pie
 * chart ready data. 
 *
 * Test it with sample data.

input: 
[
    {
        "name": "Department for Education",
        "current-data": {
            "aggr": null,
            "change": 4.2,
            "devel": 1000000000,
            "more": "data as needed",
            "notes": "Important points here",
            "recur": 1000000000
        },
        "level": "Program Expenditure",
        "drillable": true
    },
    {
        "name": "Department for Health",
        "current-data": {
            "aggr": null,
            "change": 4.2,
            "devel": 1000000000,
            "more": "data as needed",
            "notes": "Important points here",
            "recur": 1000000000
        },
        "level": "Program Expenditure",
        "drillable": true
    }
]

output:

[
    {
        "key": "Department for Education",
        "y": 1000000000
    },
    {
        "key": "Department for Health",
        "y": 1000000000
    }
]

 * 
 * @param {Array} categories Array of categories (any level)
 * 
 * @return {Array} pieData Array ready for use in D3 pie charts.
 */
var getPieChartData = function(categories) {
  
    var pieData = [];

    // Just using 'aggr' for now...
    for(var i=0; i<categories.length; i++) {
				var aggr = categories[i]['current-data'].aggr;
				if (aggr) { // Only push data if there is some
						pieData.push(
								{
										key: categories[i].name, 
										y: parseFloat(aggr) 
								}
						);
				}
    }
    
    return groupOthers(pieData,16); // will only group if needed
  
}

/**
 * @description
 *
 * This utility function is used to mash-up data from model into D3
 * bar chart ready data. At the moment is only prepares bar chart data
 * using the aggregate costs but this can later be refined to do what we
 * want.
 * 
 * Test it with sample data.

input: 
{
    "2013": {
        "aggr": 1000000,
        "program_type": "recurrent",
        "notes": "Important points here",
        "more": "data as needed"
    },
    "2012": {
        "aggr": 1200000,
        "program_type": "development",
        "notes": "Important points here",
        "more": "data as needed"
    },
    "2011": {
        "aggr": 1300000,
        "program_type": "recurrent",
        "notes": "Important points here",
        "more": "data as needed"
    }
}

output:
[
    {
        "key": "Costs",
        "values": [ [ "2013" , 1000000] , 
	            [ "2012" , 1200000] , 
		    [ "2011" , 1300000] ]
    }
]

 * @param {Array} data Array containing the last three years worth of
 * data for a given Department, Program, Sub-program...
 * 
 * @return {Array} barData ready for use in D3 charts.
 */
var getBarChartData = function(data) {

    // First turn the object into array so it can easily be reduced to
    // a form convenient for D3 charts.
    var data_as_array = objectToArray(data);

    var barValues = [];
    var barData = [
				{
            "key": "Expenditure",
            "values": barValues
				}
    ];

    /**
     * Reduce function that consolidates new bar chart data from the next 
     * object (i.e. next year)
     * 
     * Eventually will have to check for the existance of cost figures 
     * before trying to get values and pushing them to the set.
     */
    var reduceFunction = function(memory, object) {
				var prop = getFirstProperty(object); // the year
				var cost = parseInt(object[prop]['aggr']); //* $scope.currency_multiplier; // the cost figure
				
				barValues = memory[0]['values'].push([prop,cost]);
				
				return 	barData;
    }

    // Not the most purest use of reduce with some imperative stuff
    // mixed in, but working for now
    return _.reduce(data_as_array, reduceFunction, barData);

}

var getPercentageHistory = function (data){

    // First turn the object into array so it can easily be reduced to
    // a form convenient for D3 charts.
    var data_as_array = objectToArray(data);

    var barValues = [];
    var barData = [
				{
            "key": "Percentage",
            "values": barValues
				}
    ];

    /**
     * Reduce function that consolidates new bar chart data from the next 
     * object (i.e. next year)
     * 
     * Eventually will have to check for the existance of cost figures 
     * before trying to get values and pushing them to the set.
     */
    var reduceFunction = function(memory, object) {
				var prop = getFirstProperty(object); // the year
				var cost = parseInt(object[prop]['percentage']);
				
				barValues = memory[0]['values'].push([prop,cost]);
				
				return 	barData;
    }

    // Not the most purest use of reduce with some imperative stuff
    // mixed in, but working for now
    return _.reduce(data_as_array, reduceFunction, barData);

}

/**
 * @description
 *
 * This utility function is to go from pie chart data to a simple one
 * series bar chart data. It is used mainly to display the "others"
 * slice in a pie chart as bar chart.
 *
 * Test it with sample data.

input:

[
    {
        "key": "Department for Education",
        "y": 1000000000
    },
    {
        "key": "Department for Health",
        "y": 1000000000
    }
]

output:
[
    {
        "key": "Others",
        "values": [ [ "Department for Education" , 1000000000] , 
	            [ "Department for Health" , 1000000000] ]
    }
]

 * 
 * @param {Array} arr Array of pie chart objects
 * 
 * @return {Array} barData ready for use in D3 charts.
 */
var convertPieToBarData = function(arr) {    
    var values = _.map(arr,function(item){return [item['key'], item['y']];});
    
    return [{"key": "Other", "values": values}];
    
}

/**
 * @description
 *
 * Small utility to return the first property name for an object
 * 
 * @param {Object} obj Object to iterate
 * @return {String} prop String property name
 */
var getFirstProperty = function (obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
	    return prop;
	}
    }
}

/**
 * @description
 *
 * Small utility to return an object turned into an array of
 * objects. This is only a convenience function to produce bar charts
 * data. For example,

[input]
var sample_data = {
    "2013": {
        "aggr": 1000000,
        "program_type": "recurrent",
        "notes": "Important points here",
        "more": "data as needed"
    },
    "2012": {
        "aggr": 1000000,
        "program_type": "development",
        "notes": "Important points here",
        "more": "data as needed"
    },
    "2011": {
        "aggr": 1000000,
        "program_type": "recurrent",
        "notes": "Important points here",
        "more": "data as needed"
    }
}

[output]
[
  {
    "2013": {
      "aggr": 1000000,
      "program_type": "recurrent",
      "notes": "Important points here",
      "more": "data as needed"
    }
  },
  {
    "2012": {
      "aggr": 1000000,
      "program_type": "development",
      "notes": "Important points here",
      "more": "data as needed"
    }
  },
  {
    "2011": {
      "aggr": 1000000,
      "program_type": "recurrent",
      "notes": "Important points here",
      "more": "data as needed"
    }
  }
]

 * 
 * @param {Object} obj Object to iterate
 * @return {String} prop String property name
 */
var objectToArray = function (obj) {
    var obj_as_array = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) { // skip inherited properties
	    var new_obj = {};
	    new_obj[prop] = obj[prop];
	    obj_as_array.push(new_obj);
	}
    }
    return obj_as_array;
}


/**
 * @description
 *
 * Utility to return a convenient mapping of all possible paths in a JSON budget
 * 
 * @param {Object} budget Object the full yearly budget model for a
 * given Pacific country
 * @return {Object} paths Object of all possible path mapping
 * (e.g. {'Department of Health': 'root.depart-health',
 *        'Program of Public Health': 'root.depart-health.prg-pub-hea'})
 */
var getPathMappings = function (budget) {
    var mapping = {};

    function process(obj, mapping, current){
	var ikey, value;
	for(var key in obj){
            if(obj.hasOwnProperty(key)){
		value = obj[key];
		ikey = current ? current + '.' + key : key;
		if(typeof value == 'object'){
                    process(value, mapping, ikey) // recurse deeper
		} else {
		    // All paths in the tree are processed, the ones
		    // ending with .names are the paths of interest
		    if (ikey.endsWith('.name')) {
			mapping[value] = ikey.replace('.name','');
		    }
		}
            }
	}
	return mapping;
    }    

    process(budget, mapping, '');

    return mapping;

}

/**
 * Cloning technique describe at <oranlooney.com/functional-javascript>.
 * 
 * Note that assigning a new value to a property of the clone won't
 * interfere with the original, but assigning values to the clone's
 * object properties will.
 *
 * A shallow copy was chosen instead of this cloning approach, but
 * keeping it here anyway; it might prove useful.
 */
var clone = (function() { 
    return function (obj) { Clone.prototype=obj; return new Clone() };
    function Clone(){}
}());


/**
 * @description
 *
 * Small utility to slice an array of string based on string elements
 * instead of indices.
 * 
 * @param {Array} arr Array to slice
 * @param {String} start String to start slice
 * @param {String} end String to end slice
 * @return {Array} arr Array sliced
 */
var sliceByStringElement = function (arr,end,start) {

    var start = (typeof start === "undefined") ? arr[0] : start;
    var new_arr = [];

    if (!_.contains(arr,start) || !_.contains(arr,end)) {
	throw "Element not present in array"
    }

    for(var i=0; i<arr.length; i++) {
        if (arr[i] === start) {
	    for (var j=i; j<arr.length; j++) {
		if (arr[j] === end) {
		    new_arr.push(arr[j]);
		    break;
		}
		new_arr.push(arr[j]);
	    }
        }
    }

    return new_arr;

}


/**
 * @description
 *
 * Small utility to group a number of categories together. It is
 * useful when a pie chart is used but has too many slices to
 * display. At the moment is takes a fixed constant number of slice
 * and groups the remaining. Eventually, if a good method is found it
 * could be implemented by passing in a function as argument. The only
 * important thing is that the input and output of this function
 * remains the same and everything else should just work.

input: 
[
    {
        "key": "Department for Education",
        "y": 1000000000
    },
    {
        "key": "Department for Health",
        "y": 1000000000
    },
    ... (many more groups)
]

output:

{
  "top": [
    {
        "key": "Department for Education",
        "y": 1000000000
    },
    {
        "key": "Department for Health",
        "y": 1000000000
    },
    {
        "key": "Department for Justice",
        "y": 1000000000
    },
    {
        "key": "Department for Women",
        "y": 1000000000
    },
    {
        "key": "Others",
        "y": 1000000000
    }
  ],
 
  "Other": [
    {
        "key": "Department for Education",
        "y": 1000000000
    },
    {
        "key": "Department for Health",
        "y": 1000000000
    },
    ... (many more groups)
  ]

}

 * 
 * @param {Array} arr array of group objects
 * @param {Number} num Number of slices
 * @return {Object} obj Object containing the top and others separately
 */
var groupOthers = function (arr,num) {

    if (arr.length <= num) {
	return arr;
    }

    var top = arr.slice(0,num);
    var others = arr.slice(num,arr.length);

    var others_aggregated = _.reduce(others, 
				     function(memory,obj) {
					 return memory + obj['y'];},
				     0);

    top.push({"key": "Other",
	      "y": others_aggregated});

    return {
	"top" : top,
	"Other" : convertPieToBarData(others)
    };

}

var sample_pie_slices = [
  {
    "key": "Treasury and Finance Misc",
    "y": 1130200
  },
  {
    "key": "Public Debt Charges",
    "y": 751300
  },
  {
    "key": "Department of National Planning and Monitoring",
    "y": 516712.9
  },
  {
    "key": "Department of Treasury",
    "y": 220498.5
  },
  {
    "key": "Department of Prime Minister & NEC",
    "y": 189336.2
  },
  {
    "key": "Department of Personnel Management",
    "y": 169657.8
  },
  {
    "key": "National Parliament",
    "y": 130724.6
  },
  {
    "key": "Department of Foreign Affairs and Trade",
    "y": 127110.1
  },
  {
    "key": "Internal Revenue Commission",
    "y": 76235
  },
  {
    "key": "Department for Local and Provincial Affairs",
    "y": 74723.7
  },
  {
    "key": "PNG Customs Service",
    "y": 63498.2
  },
  {
    "key": "Department of Finance",
    "y": 52326.2
  },
  {
    "key": "Provincial Treasuries",
    "y": 40059.1
  },
  {
    "key": "Electoral Commission",
    "y": 36981.2
  },
  {
    "key": "Department of Industrial Relations",
    "y": 27093.3
  },
  {
    "key": "PNG Fire Services",
    "y": 22616.4
  },
  {
    "key": "Information Technology Division",
    "y": 19778.8
  },
  {
    "key": "Ombudsman Commission",
    "y": 18115
  },
  {
    "key": "Office of the Auditor-General",
    "y": 18001
  },
  {
    "key": "PNG Immigration and Citizenship Services",
    "y": 8665.5
  },
  {
    "key": "Registrar For Politcal Parties",
    "y": 7472.3
  },
  {
    "key": "PNG Institute of Public Administration",
    "y": 6819.1
  },
  {
    "key": "Public Service Commission",
    "y": 6188.8
  },
  {
    "key": "National Statistical Office ",
    "y": 6008.1
  },
  {
    "key": "Papua New Guinea Accidents Investigation Commission",
    "y": 5566
  },
  {
    "key": "Office of Governor-General",
    "y": 4706.5
  },
  {
    "key": "National Intelligence Organisation",
    "y": 4372.5
  },
  {
    "key": "Office of Bougainville Affairs",
    "y": 3293.7
  },
  {
    "key": "National Training Council",
    "y": 3125
  },
  {
    "key": "National Economic & Fiscal Commission",
    "y": 2920
  },
  {
    "key": "Central Supply & Tenders Board",
    "y": 2636.9
  },
  {
    "key": "National Tripartite Consultative Council",
    "y": 850.4
  }
];

// Normally shouldn't modify base objects I don't own. But fuck it,
// whoever works on this code base will have to pay attention so I can
// get my convenient and clear methods :)

/**
 * Modify the prototype to add builtin endsWith method
 */
String.prototype.endsWith = function (s) {
    return this.length >= s.length && this.substr(this.length - s.length) == s;
};

/**
 * Modify the prototype to add builtin contains method
 */
String.prototype.contains = function(s) {
    return this.indexOf(s) != -1;
};

/** 
 * These are to format numbers to make them more lay-person friendly
 */
// Truncate a number to ind decimal places
var truncNb = function(Nb, ind) {
    var _nb = Nb * (Math.pow(10,ind));
    _nb = Math.round(_nb);
    _nb = _nb / (Math.pow(10,ind));
    return _nb;
};
// convert a big number to '$num Billion/Million/Thousand'
var int2roundKMG = function(val) {
    
    var _str = "";

		val = typeof val !== 'undefined' ? val : '';

		var is_negative = val.match(/^-/);

    var all_commas = /,/g;
    val = val.replace(all_commas,"");
    val = val.replace (/\.*/,'');
		val = val.replace ('-','');

    if (val >= 1e9)        { 
				_str = truncNb((val/1e9), 2) + ' Billion';
    } else if (val >= 1e6) { 
				_str = truncNb((val/1e6), 2) + ' Million';
    } 
    else if (val >= 1e3) { 
				_str = truncNb((val/1e3), 2) + ' Thousand';
    } else { 
				_str = parseInt(val);
    }

    return is_negative ? '-' + _str : _str;
};

// Convert numbers into x.xx Millions
var int2roundM = function(val) {
    
    var _str = "";

    val = val.replace (/\,/g,'');
    val = val.replace (/\.0/,'');

    return truncNb((val/1e6), 2);
 
};

