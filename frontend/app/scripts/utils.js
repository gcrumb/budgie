/**
 * @license Put name and version
 * (c) 2013-2014 Nasara Holdings. http://nasara.com
 * License: Put license here.
 */

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
var drill = function (budget, path) {

    //var current_year = budget['_id'].match('[0-9]{4}');
    var current_year = 2014;

    // Work on a copy of the data to not mutate original.
    var budget_copy = JSON.parse(JSON.stringify(budget));

    // Extract budget segment of interest in its raw form. This will
    // contain all raw data from point of interest all the way up the
    // tree.
    console.debug('PATH: ' + path);
    var budget_segment = _.deep(budget_copy,path);

    // Go through categories of this segment of interest, mash-up data
    // in a convenient way for use in controller: only include name,
    // current data and a boolean drillable flag.

    var raw_categories = budget_segment.categories;
    var categories = [];
    console.log('Raw categories: ', raw_categories);

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
 * Simple usage examples with sample PNG budget.
 **/

var sample_budget = {
    "_id": "png-2013",
    "_rev": "1-521793c5646a4f9e4da35e9404717662",
    "root": {
        "name": "PNG Budget",
        "data": {
            "2013": {
                "devel": 1000000000,
                "recur": 1000000000,
                "aggr": null,
                "change": 4.2,
                "notes": "Important points here",
                "more": "data as needed"
            },
            "2012": {
                "devel": 0,
                "recur": 1000000000,
                "aggr": 12300000000,
                "notes": "Important points here",
                "more": "data as needed"
            },
            "2011": {
                "recur": 1000000000,
                "aggr": null,
                "notes": "Important points here",
                "more": "data as needed"
            }
        },
        "level": "Departmental Expenditure",
        "categories": {
            "depart-health": {
                "name": "Department for Health",
                "data": {
                    "2013": {
                        "devel": 1000000000,
                        "recur": 1000000000,
                        "aggr": null,
                        "change": 4.2,
                        "notes": "Important points here",
                        "more": "data as needed"
                    },
                    "2012": {
                        "devel": 0,
                        "recur": 1000000000,
                        "aggr": 12300000000,
                        "notes": "Important points here",
                        "more": "data as needed"
                    },
                    "2011": {
                        "recur": 1000000000,
                        "aggr": null,
                        "notes": "Important points here",
                        "more": "data as needed"
                    }
                },
                "level": "Program Expenditure",
                "categories": {
                    "progr-curry-eating": {
                        "name": "Program for Curry Eating",
                        "data": {
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
                        },
                        "level": "Sub-program Expenditure",
                        "categories": {
                            "sub-progr-spicy-curry": {
                                "name": "Sub-program for Spicy Curry",
                                "data": {
                                    "2013": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    },
                                    "2011": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    }
                                }
                            },
                            "sub-progr-mild-curry": {
                                "name": "Sub-program for Mild Curry",
                                "data": {
                                    "2013": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    },
                                    "2011": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "depart-edu": {
                "name": "Department for Education",
                "data": {
                    "2013": {
                        "devel": 1000000000,
                        "recur": 1000000000,
                        "aggr": null,
                        "change": 4.2,
                        "notes": "Important points here",
                        "more": "data as needed"
                    },
                    "2012": {
                        "devel": 0,
                        "recur": 1000000000,
                        "aggr": 12300000000,
                        "notes": "Important points here",
                        "more": "data as needed"
                    },
                    "2011": {
                        "recur": 1000000000,
                        "aggr": null,
                        "notes": "Important points here",
                        "more": "data as needed"
                    }
                },
                "level": "Program Expenditure",
                "categories": {
                    "progr-arts": {
                        "name": "Program for Arts",
                        "data": {
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
                        },
                        "level": "Sub-program Expenditure",
                        "categories": {
                            "sub-progr-painting": {
                                "name": "Sub-program for Painting",
                                "data": {
                                    "2013": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    },
                                    "2011": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    }
                                }
                            },
                            "sub-progr-lang": {
                                "name": "Sub-program for Languages",
                                "data": {
                                    "2013": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    },
                                    "2011": {
                                        "aggr": 1000000,
                                        "notes": "Important points here"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

//drill(budget,'root.categories.depart-edu.categories.progr-arts');
//drill(budget,'root.categories.depart-edu');
//drill(budget,'root.categories.depart-health.categories.progr-curry-eating');

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
		{key: categories[i].name, 
		 y: aggr
		}
	    );
	}
    }
   
    return pieData;
  
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
            "key": "Costs",
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
	var cost = object[prop]['aggr']; // the cost figure
	
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

