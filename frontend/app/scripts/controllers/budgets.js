'use strict';

/* Budget controller(s) */

/* Change this to a backend REST call */
var budget = {
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

angular.module('pippDataApp.controllers.budgets', [])
    .controller('BudgetCtrl', ['$scope', '$location', function ($scope, $location) {

	$scope.title1 = "Departmental Expenditure";
	$scope.title2 = "Departmental Expenditure Summary";
	$scope.country = "Papua New Guinea";

	var budgetDataRaw = drill(budget,'root');

        $scope.budgetData = [
            {
                key: "One",
                y: 5
            },
            {
                key: "Two",
                y: 2
            },
            {
                key: "Three",
                y: 9
            },
            {
                key: "Four",
                y: 7
            },
            {
                key: "Five",
                y: 4
            },
            {
                key: "Six",
                y: 3
            },
            {
                key: "Seven",
                y: 9
            }
        ];

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


	console.log($location.path());

    }]);
