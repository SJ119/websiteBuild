/* jshint debug: true */
angular.module('lineGraph')
	.directive('lineGraph', ['$window', function($window) {
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

				var getParentWidth = function(elm) {
					return $(elm).parent().width() - scope.config.dimensions.margin.left - scope.config.dimensions.margin.right;
				};

				var computeClosest = function(elm) {
					var x = d3.event.pageX;

					//Check for less than 2 nodes
					if (scope.nodeLocations.length === 0) {
						return;
					} else if (scope.nodeLocations.length === 1) {
						return 0;
					}

					//Assume evenly distributed scale
					var difference = Math.abs(scope.nodeLocations[1] - scope.nodeLocations[0]);

					//Assume node locations ordered in increasing fashion
					for (var i in scope.nodeLocations) {
						if (i == (scope.nodeLocations.length - 1) || x < scope.nodeLocations[i] + difference / 2) {
							return i;
						}
					}
				};

				var getLocation = function(elm, type) {
					var nodes = elm.selectAll(type)[0];

					var locations = nodes.map(function(d) {
						var boundingClientRect = d.getBoundingClientRect();
						return boundingClientRect.left + boundingClientRect.width / 2;
					});

					return locations;
				};

				var initScales = function() {
					scope.terms = scope.data.map(function(d) {
						return d.term;
					});

					//Create scales
					scope.xScale = d3.scale.ordinal().domain(scope.terms).rangeRoundPoints([0, scope.config.dimensions.width], 1);
					scope.yScale = d3.scale.linear().domain([scope.config.data.min, scope.config.data.max]).range([scope.config.dimensions.height, 0]);
				};

				var initAxis = function() {
					//Create x and y axis
					scope.xAxis = d3.svg.axis().scale(scope.xScale);
					scope.yAxis = d3.svg.axis().scale(scope.yScale).orient('left');
				};

				var createLine = function() {
					//Create line
					scope.lineGen = d3.svg.line()
						.x(function(d) {
							return scope.xScale(d.term);
						})
						.y(function(d) {
							return scope.yScale(d.termAvg);
						});
				};


				var init = function() {
					if (scope.tip) {
						scope.tip.destroy();
					}

					//Create line-graph object
					scope.selection = d3.select(element[0]);
					scope.selection.selectAll('*').remove();

					scope.selection
						.append('h3')
						.attr({
							'class': 'graph-title'
						})
						.text(scope.config.data.title);

					scope.selection
						.append('div')
						.attr('id', scope.config.id)
						.attr('class', scope.config.class)
						.style({
							'width': (scope.config.dimensions.width + scope.config.dimensions.margin.left + scope.config.dimensions.margin.right) + 'px',
							'height': (scope.config.dimensions.height + scope.config.dimensions.margin.top + scope.config.dimensions.margin.bottom) + 'px'
						})
						.append('svg')
						.attr({
							'class': scope.config.class + '-svg',
							'width': scope.config.dimensions.width + scope.config.dimensions.margin.left + scope.config.dimensions.margin.right,
							'height': scope.config.dimensions.height + scope.config.dimensions.margin.top + scope.config.dimensions.margin.bottom
						})
						.style({
							'background-color': '#D8B4AB',
							'border-radius': '5px',
							'border': '3px solid #796560',
							'margin-left': 'auto',
							'margin-right': 'auto',
							'max-width': scope.config.dimensions.maxWidth + 'px'
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

					scope.third = scope.selection.select('#' + scope.config.id + ' .' + scope.config.class + '-svg')[0][0].getBoundingClientRect();

					createLine();

					//Append line to graph
					scope.container
						.append('path')
						.attr('d', scope.lineGen(scope.data))
						.attr('stroke', 'green')
						.attr('stroke-width', 2)
						.attr('fill', 'none');

					//Potential guidelines go here
					scope.container
						.append('path')
						.attr('class', 'line-graph-x-guideline');

					//Add nodes to graph
					scope.container.selectAll('.line-graph-nodes').data(scope.data)
						.enter()
						.append('circle')
						.attr({
							'class': function(d, i) {
								return 'line-graph-nodes line-graph-node-' + scope.terms[i];
							},
							'cx': 0,
							'cy': 0,
							'r': 5,
							'fill': scope.config.data.color,
							'stroke': scope.config.data.outline,
							'transform': function(d) {
								return 'translate(' + scope.xScale(d.term) + ',' + scope.yScale(d.termAvg) + ')';
							}
						});

					scope.specificGrades = scope.data.map(function(d) {
						return d.courses.map(function(x) {
							return x.grade;
						});
					});

					//Add specific marks
					angular.forEach(scope.specificGrades, function(value, key) {

						scope.container.selectAll('.line-graph-nodes-specific-' + scope.terms[key]).data(value)
							.enter()
							.append('circle')
							.attr({
								'class': function(d, i) {
									return 'line-graph-nodes-specific line-graph-nodes-specific-' + scope.terms[key];
								},
								'cx': 0,
								'cy': 0,
								'r': 3,
								'fill': function(d, i) {
    								return scope.config.data.colors[i];
								},
								'stroke': scope.config.data.outline,
								'fill-opacity': 0,
								'stroke-opacity': 0,
								'transform': function(d) {
									return 'translate(' + scope.xScale(scope.terms[key]) + ',' + scope.yScale(d) + ')';
								}
							});
					});

					//Initialize locations for nodes
					scope.nodeLocations = getLocation(scope.graph, '.line-graph-nodes');

					//Mouse event when hovering over svg
					scope.graph.on('mousemove', function() {
						scope.i = computeClosest(scope.graph);
						scope.term = scope.terms[scope.i];

						// Add guideline
						scope.container.select('.line-graph-x-guideline')
							.attr('d', function() {
								var x = scope.xScale(scope.term);
								return ['M', x, scope.yScale(scope.config.data.min), 'L', x, scope.yScale(scope.config.data.max), 'Z'].join(' ');
							})
							.attr({
								'stroke': scope.config.guideline.color,
								'stroke-opacity': scope.config.guideline.opacity
							});

						// Change selected node color
						scope.container.selectAll('.line-graph-nodes')
							.attr('fill', scope.config.data.color);

						scope.container.selectAll('.line-graph-node-' + scope.term)
							.attr('fill', scope.config.data.colorOver);

						// Show specific grades
						scope.container.selectAll('.line-graph-nodes-specific')
							.attr({
								'fill-opacity': 0,
								'stroke-opacity': 0
							});

						scope.container.selectAll('.line-graph-nodes-specific-' + scope.term)
							.attr({
								'fill-opacity': 1,
								'stroke-opacity': 1
							});

						var data = scope.data[scope.i];
						var term = data.term;
						var sortedData = data.courses.sort(function(a, b) {
							return b.grade - a.grade;
						});
						var grades = sortedData.map(function(d) {
							return d.grade;
						});
						var courses = sortedData.map(function(d) {
							return d.course;
						});

						var x = scope.xScale(scope.term) + scope.config.tooltip.offset.x + scope.config.dimensions.margin.left + scope.third.left; // scope.svgPosition.left + scope.parentPosition.left;
						var y = d3.event.pageY + scope.config.tooltip.offset.y;

						var mousePointer = d3.mouse(this);

						var tmp = scope.tip.show(scope.config.tooltip.format(data.termAvg, term, courses, grades, scope.config.data.colors, scope.config.data.color));

						//debugger;
						var tipSelection = d3.select('#' + scope.config.id + '-tooltip');
						var tipWidth = parseInt(tipSelection.style('width'), 10);
						var tipHeight = parseInt(tipSelection.style('height'), 10);

						if (scope.xScale(scope.term) + scope.config.tooltip.offset.x + tipWidth > scope.config.dimensions.width) {
							//console.log('hi');
							x = x - (scope.config.tooltip.offset.x * 2 + tipWidth);
						}

						if (mousePointer[1] + scope.config.tooltip.offset.y + tipHeight > scope.config.dimensions.height + scope.config.dimensions.margin.top + scope.config.dimensions.margin.bottom) {
							//console.log('hi');
							y = y - (scope.config.tooltip.offset.y * 2 + tipHeight);
						}

						tmp.style('left', x + 'px');
						tmp.style('top', y + 'px');
						return tmp;
					});


					//Mouse event when leaving svg
					scope.graph.on('mouseout', function() {
						scope.container.selectAll('.line-graph-nodes')
							.attr('fill', scope.config.data.color);

						// Show specific grades
						scope.container.selectAll('.line-graph-nodes-specific-' + scope.term)
							.attr({
								'fill-opacity': 0,
								'stroke-opacity': 0
							});

						scope.container.select('.line-graph-x-guideline')
							.attr('d', null);

						return scope.tip.hide();
					});

					// Initialize tooltip
					scope.tip = d3.tip().attr('class', 'd3-tip')
						.html(function(d) {
							return '<div class="line-graph-tooltip" id="' + scope.config.id + '-tooltip" style="' + scope.config.tooltip.width + 'px">' + d + '</div>';
						});

					// Invoke tooltip on svg container
					scope.graph.call(scope.tip);

				};



				if (scope.config.autoresize) {
					var maxWidth = scope.config.dimensions.maxWidth - scope.config.dimensions.margin.left - scope.config.dimensions.margin.right;
					scope.config.dimensions.width = Math.min(maxWidth, getParentWidth(element[0]));

					$(window).resize(function() {
						scope.config.dimensions.width = Math.min(maxWidth, getParentWidth(element[0]));
						init();
					});
				}

				init();

			}
		};
	}]);