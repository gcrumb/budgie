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

    // Extract budget segment of interest in its raw form. This will
    // contain all raw data from point of interest all the way up the
    // tree.
    var budget_segment = _.deep(budget,path);

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
	cat['current-data'] = raw_categories[category]['data']['2013'];
	cat['level'] = raw_categories[category].level;
	if (_.has(raw_categories[category], "categories")) {
	    cat['drillable'] = true;
	} else {
	    cat['drillable'] = false;
	}
	categories.push(cat);
    }

    // Replace raw categories with only the necessary information to
    // draw the view. In other words, all data further up the tree
    // that is not needed will not be included. The mashed-up
    // categories above will be set instead of the raw categories
    // (which may or may not contain an arbitrary number of data
    // further up the tree)

    return _.deep(budget_segment, 'categories', categories);

};

/**
 * Simple usage examples with sample PNG budget.
 **/

var budget = {
    "_id": "png-2013",
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

var sample_data = [
    {
        "2013": {
            "devel": 1000000000,
            "recur": 1000000000,
            "aggr": null,
            "change": 4.2,
            "notes": "Important points here",
            "more": "data as needed"
        }
    },
    {
        "2012": {
            "devel": 0,
            "recur": 1000000000,
            "aggr": 12300000000,
            "notes": "Important points here",
            "more": "data as needed"
        }
    },
    {
        "2011": {
            "recur": 1000000000,
            "aggr": null,
            "notes": "Important points here",
            "more": "data as needed"
        }
    }
];

//drill(budget,'root.categories.depart-edu.categories.progr-arts');
//drill(budget,'root.categories.depart-edu');
//drill(budget,'root.categories.depart-health.categories.progr-curry-eating');

/**
 * @description
 *
 * This utility function is used mash data from model into D3 pie
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
 * @param {Array} pieData Array ready for use in D3 pie charts.
 */
var getPieChartData = function(categories) {
  
    var pieData = [];

    /* Just using 'recur' for now to get the logic working */
    for(var i=0; i<categories.length; i++) {
	pieData.push(
	    {key: categories[i].name, 
	     y: categories[i]['current-data'].recur
	    }
	);
    }
   
    return pieData;
  
}

/**
 * @description
 *
 * This utility function is used in a map function to prepare data for
 * D3 bar charts. At the moment is only prepares bar chart data suing
 * the recur costs but this can later be refined to do what we want.
 * 
 * Test it with sample data.

input: 
[
    {
        "2013": {
            "devel": 1000000000,
            "recur": 1000000000,
            "aggr": null,
            "change": 4.2,
            "notes": "Important points here",
            "more": "data as needed"
        }
    },
    {
        "2012": {
            "devel": 0,
            "recur": 1000000000,
            "aggr": 12300000000,
            "notes": "Important points here",
            "more": "data as needed"
        }
    },
    {
        "2011": {
            "recur": 1000000000,
            "aggr": null,
            "notes": "Important points here",
            "more": "data as needed"
        }
    }
]

output:
[
    {
        "key": "Recurring Costs",
        "values": [ [ "2013" , 1000000000] , [ "2012" , 1000000000] , [ "2011" , 1000000000] ]
    }
]

 * @param {Array} data Array containing the last three years worth of
 * data for a given Department, Program, Sub-program...
 * 
 * @param {Array} barData ready for use in D3 charts.
 */
var getBarChartData = function(data) {
    var barData = [];
    // not yet implemented
    barData = [
	{
            "key": "Recurring Costs",
            "values": [ [ "2013" , 1000000] , 
			[ "2012" , 2000000] , 
			[ "2011" , 3000000] ]
	}
    ];

    return barData;

}
