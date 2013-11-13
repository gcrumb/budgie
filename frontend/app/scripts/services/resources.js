'use strict';

/* HTTP resource services */

//var wsUrl = 'https://candy.pacificpolicy.org';
var wsUrl = 'http://localhost\\:5000'; // for dev, don't commit

angular.module('pippDataApp.services.resources', [])
    .factory('MetaFactory', [$resource, function ($resource) {
	return $resource(wsUrl, {}, {
            query: { method: 'GET',
                     transformResponse: function (data) {
			 return angular.fromJson(data).meta;
                     },
                     isArray: false }
	});
    }])
    .factory('BudgetFactory', [$http, function ($http) {

	var baseUrl = wsUrl + '/budget';

	return {
	    get: function(budget_id) {
		return $http.get(budgetUrl + '/' + budget_id);
	    },
	    save: function(budget, budget_id) { // Can only add new as it is...
		var url = baseUrl + '/' + budget_id;
		return $http.put(url, budget);
	    }
	};

    }]);

services.factory('CandyResourceFactory', function ($resource) {
    var candyResource = wsUrl + '/basket/candies/:_id';

    /* Return a resource ready for CRUD ops */
    return $resource(candyResource, {}, {

	// Angular comes with default methods on Resource objects, but
	// I opted to explicitly defined mine here for clarity. I also
	// had to override default behavior in some places.
	'query': { method: "GET", isArray: true,
		   transformResponse: function (data) {
                       return angular.fromJson(data).candies_by_id;
                   } },
	'create': { method: "POST" },
	'read': { method: 'GET', params: { _id: "@_id" } },
	'update': { method: 'PUT', params: { _id: "@_id" } },
	'remove': { method: 'DELETE', params: { _id: "@_id" } }
    });

});

services.factory('TagsResourceFactory', function ($resource) {
    return $resource(wsUrl + '/basket/candies/tags', {}, {
        query: { method: 'GET',
                 transformResponse: function (data) {
                     return angular.fromJson(data).tags;
                 },
                 isArray: false }
    });
});

services.factory('TagsByCandiesResourceFactory', function ($resource) {
    return $resource(wsUrl + '/basket/candies/tags-by-candies', {}, {
        query: { method: 'GET',
                 transformResponse: function (data) {
                     return angular.fromJson(data).tags_by_candies;
                 },
                 isArray: false }
    });
});
