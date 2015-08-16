angular.module('scatterPlot')
	.directive('scatterPlot', function() {
		return {
			restrict: 'E',
			scope: {
				data: '=',
				config: '='
			},
			link: function(scope, element) {

				var toPx = function(n) {
					return n + 'px';
				};

				var init = function() {

					//Create scatter-plot object

				};
			}
		};
	});