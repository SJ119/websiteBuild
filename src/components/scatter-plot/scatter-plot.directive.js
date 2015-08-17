angular.module('scatterPlot')
	.directive('scatterPlot', ['line-service', function(LineService) {
		return {
			restrict: 'E',
			scope: {
				data: '=',
				config: '='
			},
			link: function(scope, element) {

				scope.lineService = new LineService();


				var toPx = function(n) {
					return n + 'px';
				};

				var getData = function(type) {
					return scope.data.map(function(d) {
						return d[type];
					});
				};

				var getParentWidth = function(elm) {
					return $(elm).parent().width() - scope.config.dimensions.margin.left - scope.config.dimensions.margin.right;
				};

				var generateValues = function(scale, n) {
					var arr = [];

					var interval = Math.abs(scale.domain()[1] - scale.domain()[0]);

					var step = interval / (n - 1);

					var initial = scale.domain()[0];

					for (var i = 0; i < n; i++) {
						arr.push(initial);
						initial += step;
					}
					return arr;
				};

				var initScales = function() {
					scope.xData = getData(scope.config.data.x);
					scope.xScale = scope.lineService.initLinearScale([0, scope.config.dimensions.width]);
					scope.lineService.setDomain(scope.xScale, [d3.min(scope.xData), d3.max(scope.xData)], scope.config.data.offset);

					scope.yData = getData(scope.config.data.y);
					scope.yScale = scope.lineService.initLinearScale([scope.config.dimensions.height, 0]);
					scope.lineService.setDomain(scope.yScale, [d3.min(scope.yData), d3.max(scope.yData)], scope.config.data.offset);

					scope.zData = getData(scope.config.data.z);
					scope.zScale = scope.lineService.initLinearScale([scope.config.data.r.min, scope.config.data.r.max]);
					scope.lineService.setDomain(scope.zScale, [d3.min(scope.zData), d3.max(scope.zData)]);
				};

				var initAxis = function() {
					scope.xAxis = scope.lineService.initAxis(scope.xScale);
					scope.xAxis.tickValues(generateValues(scope.xScale, scope.config.data.ticks.x));

					scope.yAxis = scope.lineService.initAxis(scope.yScale);
					scope.yAxis.tickValues(generateValues(scope.yScale, scope.config.data.ticks.y));
					scope.yAxis.orient('left');
				};

				scope.init = function() {

					if (scope.tip) {
						scope.tip.destroy();
					}

					//Create scatter-plot object
					scope.selection = d3.select(element[0]);
					scope.selection.selectAll('*').remove();

					scope.selection
						.append('div')
						.attr('id', scope.config.id)
						.attr('class', scope.config.class + ' graph')
						.style({
							'width': toPx(scope.config.dimensions.width + scope.config.dimensions.margin.left + scope.config.dimensions.margin.right),
							'height': toPx(scope.config.dimensions.height + scope.config.dimensions.margin.top + scope.config.dimensions.margin.bottom)
						})
						.append('svg')
						.attr({
							'class': scope.config.class + '-svg',
							'width': scope.config.dimensions.width + scope.config.dimensions.margin.left + scope.config.dimensions.margin.right,
							'height': scope.config.dimensions.height + scope.config.dimensions.margin.top + scope.config.dimensions.margin.bottom
						})
						.style({
							'background-color': scope.config.svg.backgroundColor,
							'border-radius': toPx(scope.config.svg.borderRadius),
							'border': scope.config.svg.border,
							'margin-left': scope.config.svg.marginLeft,
							'margin-right': scope.config.svg.marginRight,
							'max-width': toPx(scope.config.dimensions.maxWidth),
							'max-height': toPx(scope.config.dimensions.maxHeight)
						});

					initScales();

					initAxis();

					//Select and append axis
					scope.graph = d3.select('#' + scope.config.id).select('.' + scope.config.class + '-svg');
					scope.container = scope.graph
						.append('g')
						.attr('class', scope.config.class + '-svg-container')
						.attr('transform', ['translate(', scope.config.dimensions.margin.left, ',', scope.config.dimensions.margin.top, ')'].join(''));
					scope.container
						.append('g')
						.attr('class', scope.config.class + '-xAxis axis')
						.call(scope.xAxis)
						.attr('transform', ['translate(0,', scope.config.dimensions.height, ')'].join(''));
					scope.container
						.append('g')
						.attr('class', scope.config.class + '-yAxis axis')
						.call(scope.yAxis);

					scope.container.select('.' + scope.config.class + '-xAxis')
						.append('g')
						.attr({
							'class': 'x label',
							'text-anchor': 'middle',
							'transform': 'translate(' + scope.config.dimensions.width / 2 + ',' + (scope.config.dimensions.margin.top - 5) + ')'
						})
						.append('text')
						.text(scope.config.data.x);

					scope.container.select('.' + scope.config.class + '-yAxis')
						.append('g')
						.attr({
							'class': 'y label',
							'text-anchor': 'middle',
							'transform': 'translate(' + (-scope.config.dimensions.margin.left / 2 - 5) + ',' + scope.config.dimensions.height / 2 + ') rotate(-90)'
						})
						.append('text')
						.text(scope.config.data.y);


					scope.xGuidelines = scope.container
						.append('g')
						.attr('class', 'x guidelines');

					scope.xGuidelines.selectAll('x-guidelines').data(scope.xAxis.tickValues())
						.enter()
						.append('path')
						.attr('class', 'guideline')
						.attr('d', function(d) {
							return ['M', scope.xScale(d), scope.config.dimensions.height, 'L', scope.xScale(d), 0, 'Z'].join(' ');
						});

					scope.yGuidelines = scope.container
						.append('g')
						.attr('class', 'y guidelines');

					scope.yGuidelines.selectAll('y-guidelines').data(scope.yAxis.tickValues())
						.enter()
						.append('path')
						.attr('class', 'guideline')
						.attr('d', function(d) {
							return ['M', 0, scope.yScale(d), 'L', scope.config.dimensions.width, scope.yScale(d), 'Z'].join(' ');
						});

					scope.dataLabels = scope.container
						.append('g')
						.attr('class', 'data-labels');

					scope.dataLabels.selectAll('.labels').data(scope.data)
						.enter()
						.append('text')
						.attr({
							'class': function(d) {
								return 'labels ' + d[scope.config.data.label].split(' ').join('');
							},
							'x': function(d) {
								return scope.xScale(d[scope.config.data.x]);
							},
							'y': function(d) {
								return scope.yScale(d[scope.config.data.y]) - scope.zScale(d[scope.config.data.z]) - 2;
							},
							'opacity': scope.config.data.opacity
						})
						.text(function(d) {
							return d[scope.config.data.label].split(' ').map(function(d) {
								return d[0];
							}).join('');
						});

					scope.dataContainer = scope.container
						.append('g')
						.attr('class', 'data-container');

					scope.dataContainer.selectAll('.nodes').data(scope.data)
						.enter()
						.append('circle')
						.attr({
							'class': function(d) {
								return 'nodes ' + d[scope.config.data.label].split(' ').join('');
							},
							'r': function(d) {
								return scope.zScale(d[scope.config.data.z]);
							},
							'cx': 0,
							'cy': 0,
							'fill': function() {
								return d3.hsl(Math.random() * 360, 0.8, 0.6);
							},
							'fill-opacity': scope.config.data.opacity,
							'transform': function(d) {
								return 'translate(' + scope.xScale(d[scope.config.data.x]) + ',' + scope.yScale(d[scope.config.data.y]) + ')';
							}
						});

					scope.dataContainer.selectAll('.nodes')
						.on('mousemove', function(d) {
							scope.dataContainer.selectAll('.nodes')
								.attr('fill-opacity', 0.25);
							scope.dataLabels.selectAll('.labels')
								.attr('opacity', 0.25);

							d3.select(this)
								.attr('fill-opacity', 1);
							scope.dataLabels.select('.' + d[scope.config.data.label].split(' ').join(''))
								.attr('opacity', 1);

							var labels = [scope.config.data.x, scope.config.data.y, scope.config.data.z];
							var stats = [d[scope.config.data.x], d[scope.config.data.y], d[scope.config.data.z]];
							var tmp = scope.tip.show(scope.config.tooltip.format(d[scope.config.data.label], labels, stats, d3.select(this).attr('fill')));
							var x = d3.event.pageX + scope.config.tooltip.offset.x;
							var y = d3.event.pageY + scope.config.tooltip.offset.y;
							tmp.style('left', toPx(x));
							tmp.style('top', toPx(y));
							return tmp;
						});

					scope.dataContainer.selectAll('.nodes')
						.on('mouseout', function(d) {
							scope.dataContainer.selectAll('.nodes')
								.attr('fill-opacity', scope.config.data.opacity);
							scope.dataLabels.selectAll('.labels')
								.attr('opacity', scope.config.data.opacity);

							return scope.tip.hide();
						});

					// Initialize tooltip
					scope.tip = d3.tip().attr('class', 'd3-tip')
						.html(function(d) {
							return '<div class="scatter-plot-tooltip graph-tooltip" id="' + scope.config.id + '-tooltip">' + d + '</div>';
						});

					// Invoke tooltip on svg container
					scope.graph.call(scope.tip);

				};


				scope.$watchGroup(['config.data.x', 'config.data.y', 'config.data.z'], function(newVal) {
					scope.init();
				});

				if (scope.config.autoresize) {
					var maxWidth = scope.config.dimensions.maxWidth - scope.config.dimensions.margin.left - scope.config.dimensions.margin.right;
					var maxHeight = scope.config.dimensions.maxHeight - scope.config.dimensions.margin.top - scope.config.dimensions.margin.bottom;
					scope.config.dimensions.width = Math.min(maxWidth, getParentWidth(element[0]));
					scope.config.dimensions.height = Math.min(maxHeight, scope.config.dimensions.width);

					$(window).resize(function() {
						scope.config.dimensions.width = Math.min(maxWidth, getParentWidth(element[0]));
						scope.config.dimensions.height = Math.min(maxHeight, scope.config.dimensions.width);
						scope.init();
					});
				}

				scope.init();
			}
		};
	}]);