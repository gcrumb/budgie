'use strict';

/* HTTP resource services */

//var wsUrl = 'https://candy.pacificpolicy.org';
var wsUrl = 'http://localhost:5000'; // for dev, don't commit
//var wsUrl = 'http://freswota:5000';

angular.module('pippDataApp.services.resources', [])
    .factory('MetaFactory', ['$resource', function ($resource) {
	return $resource(wsUrl, {}, {
            query: { method: 'GET',
                     transformResponse: function (data) {
			 return angular.fromJson(data).meta;
                     },
                     isArray: false }
	});
    }])
    .factory('BudgetFactory', ['$http', function ($http) {

	var budgetUrl = wsUrl + '/budgets';

	return {
	    get: function(budget_id) {
		return $http.get(budgetUrl + '/' + budget_id);
	    },
	    save: function(budget, budget_id) { // Will be removed...
		var url = baseUrl + '/' + budget_id;
		return $http.put(url, budget);
	    }
	};

    }]);
