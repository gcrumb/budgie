angular.module('candybasket.directives.budgetTimeline', []);
angular.module('candybasket.directives.budgetTimeline').directive('budgetTimeline',
	['$sourceData',
	function ($sourceData) {
			return {
					restrict: 'AE',
					template: '<div id="budgetTimeline"></div>',
					scope: {
							sourceData: '@',
							width: '@',
							height: '@'
					},
					link: function ($scope, elt, attrs) {
							$scope.$watch('[sourceData]',
														function (newValue, oldValue) {
																// todo: only run search when searchTerm is quiescent to avoid hammering API
																// todo: rate limit searches; at least wait until previous promises resolved
																drawTimeline(sourceData);
														},
														true
													 );
							
							function drawTimeline(timelineData) {
									// redraw Timeline.js
									// todo: make timeline.js config options configurable
									// todo: promise so we can have actions after everything is complete
									console.debug(timelineData);
									if (typeof($scope.width) === 'undefined'){
											$scope.width = '100%';
									}
									if (typeof($scope.height) === 'undefined'){
											$scope.height = '100%';
									}
									
									createStoryJS({
											type: 'timeline',
											embed_id: 'budgetTimeline',
											width: $scope.width,
											height: $scope.height,
											source: sourceData
									});
							}
					}
			};
	}]);
