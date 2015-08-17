angular.module('common')
	.service('line-service', function() {
		var LineService = function(){};

		LineService.prototype.initOrdinalScale = function(range, padding) {
			return d3.scale.ordinal().rangeRoundPoints(range, padding);
		};

		LineService.prototype.initLinearScale = function(range) {
			return d3.scale.linear().range(range);
		};

		LineService.prototype.setDomain = function(scale, domain, offset) {
			if (offset !== undefined) {
				var width = Math.abs(scale.domain()[1] - scale.domain()[0]);
				domain[0] -= offset.min * width;
				domain[1] += offset.max * width;
			}
			scale.domain(domain);
		};

		LineService.prototype.initAxis = function(scale) {
			return d3.svg.axis().scale(scale);
		};

		return LineService;
	});