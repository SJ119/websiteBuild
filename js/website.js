angular.module('common', []);
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
angular.module('lineGraph', []);
angular.module('lineGraph')
	.controller('line-graph.controller', ['$scope', function($scope) {
		$scope.config = {
			id: 'line-graph-' + parseInt(Math.random() * 1000, 10),
			class: 'line-graph',
			dimensions: {
				width: 500,
				height: 300,
				maxWidth: 700,
				margin: {
					top: 40,
					left: 40,
					right: 40,
					bottom: 40
				}
			},
			svg: {
				backgroundColor: '#D8B4AB',
				borderRadius: '5px',
				border: '3px solid #796560',
				marginLeft: 'auto',
				marginRight: 'auto'
			},
			tooltip: {
				offset: {
					x: 20,
					y: 10
				},
				format: function(avg, term, courses, marks, colors, color) {
					var header = '<tr class="header"><th><span class="course-color" style="background-color: ' + color + '"></span>' + term + '</th><th class="avg">' + avg + '</th></tr>';
					var body = '';

					for (var i = 0; i < marks.length; i++) {
						body += '<tr class="body"><td class="course"><span class="course-color" style="background-color: ' + colors[i] + '"></span>' + courses[i] + '</td><td class="grade">' + marks[i] + '</td></tr>';
					}

					return '<table>' + header + body + '</table>';
				}
			},
			data: {
				min: 50,
				max: 100,
				color: '#767AB2',
				colors:  ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
				outline: '#444667', 
				colorOver: '#969BE3',
				title: 'Average per term'
			},
			guideline: {
				color: 'black',
				opacity: 0.25
			},
			backColor: '#CFCFD4',
			autoresize: true
		};

		$scope.myGrades = [{
			term: '1A',
			termAvg: 73.80,
			cumlativeAvg: 73.80,
			courses: [{
				course: 'BUS 111W',
				description: 'Introduciton to Business Organizationn (WLU)',
				grade: 72
			}, {
				course: 'CS 135',
				description: 'Designing Functional Programs',
				grade: 73
			}, {
				course: 'Econ 101',
				description: 'Introductions to Microeconomics',
				grade: 84
			}, {
				course: 'Math 135',
				description: 'Algebra for Honors Mathematics',
				grade: 70
			}, {
				course: 'Math 137',
				description: 'Calculus 1 for Honors Mathematics',
				grade: 70
			}]
		}, {
			term: '1B',
			termAvg: 73.80,
			cumlativeAvg: 73.80,
			courses: [{
				course: 'CS 136',
				description: 'Elementary Algorithm Design and Data Abstraction',
				grade: 74
			}, {
				course: 'ECON 102',
				description: 'Introduction to Macroeconomics',
				grade: 77
			}, {
				course: 'ENGL 119',
				description: 'Communications in Mathematics & Computer Science',
				grade: 84
			}, {
				course: 'Math 136',
				description: 'Linear Algebra 1 for Honors Mathematics',
				grade: 59
			}, {
				course: 'Math 138',
				description: 'Calculus 2 for Honors Mathematics',
				grade: 75
			}]
		}, {
			term: '2A',
			termAvg: 80.40,
			cumlativeAvg: 76.00,
			courses: [{
				course: 'CS 245',
				description: 'Logic and Computation',
				grade: 73
			}, {
				course: 'CS 246',
				description: 'Object-Oriented Software Development',
				grade: 86
			}, {
				course: 'MATH 239',
				description: 'Introduction to Combinatorics',
				grade: 83
			}, {
				course: 'MSCI 211',
				description: 'Organizational Behaviour',
				grade: 78
			}, {
				course: 'STAT 230',
				description: 'Probability',
				grade: 82
			}]
		}, {
			term: '2B',
			termAvg: 84.40,
			cumlativeAvg: 78.10,
			courses: [{
				course: 'CO 250',
				description: 'Introduction to Optimization',
				grade: 82
			}, {
				course: 'CS 240',
				description: 'Data Structures and Data Management',
				grade: 92
			}, {
				course: 'CS 241',
				description: 'Foundations of Sequential Programming',
				grade: 81
			}, {
				course: 'CS 251',
				description: 'Computer Organization and Design',
				grade: 96
			}, {
				course: 'STAT 231',
				description: 'Statistics',
				grade: 71
			}]
		}];

	}]);
angular.module('lineGraph')
	.directive('lineGraph', ['$window', 'line-service', function($window, LineService) {
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
					scope.xScale = scope.lineService.initOrdinalScale([0, scope.config.dimensions.width], 1);
					scope.lineService.setDomain(scope.xScale, scope.terms);
					scope.yScale = scope.lineService.initLinearScale([scope.config.dimensions.height, 0]);
					scope.lineService.setDomain(scope.yScale, [scope.config.data.min, scope.config.data.max]);

				};

				var initAxis = function() {
					//Create x and y axis
					scope.xAxis = scope.lineService.initAxis(scope.xScale);
					scope.yAxis = scope.lineService.initAxis(scope.yScale);
					scope.yAxis.orient('left');
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
							'background-color': '#D8B4AB',
							'border-radius': '5px',
							'border': '3px solid #796560',
							'margin-left': 'auto',
							'margin-right': 'auto',
							'max-width': toPx(scope.config.dimensions.maxWidth)
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

					scope.tooltipBox = scope.selection.select('#' + scope.config.id + ' .' + scope.config.class + '-svg')[0][0].getBoundingClientRect();

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

						var x = scope.xScale(scope.term) + scope.config.tooltip.offset.x + scope.config.dimensions.margin.left + scope.tooltipBox.left;
						var y = d3.event.pageY + scope.config.tooltip.offset.y;

						var mousePointer = d3.mouse(this);

						var tmp = scope.tip.show(scope.config.tooltip.format(data.termAvg, term, courses, grades, scope.config.data.colors, scope.config.data.colorOver));

						var tipSelection = d3.select('#' + scope.config.id + '-tooltip');
						var tipWidth = parseInt(tipSelection.style('width'), 10);
						var tipHeight = parseInt(tipSelection.style('height'), 10);

						if (scope.xScale(scope.term) + scope.config.tooltip.offset.x + tipWidth > scope.config.dimensions.width) {
							x = x - (scope.config.tooltip.offset.x * 2 + tipWidth);
						}

						if (mousePointer[1] + scope.config.tooltip.offset.y + tipHeight > scope.config.dimensions.height + scope.config.dimensions.margin.top + scope.config.dimensions.margin.bottom) {
							y = y - (scope.config.tooltip.offset.y * 2 + tipHeight);
						}

						tmp.style('left', toPx(x));
						tmp.style('top', toPx(y));
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
							return '<div class="line-graph-tooltip graph-tooltip" id="' + scope.config.id + '-tooltip">' + d + '</div>';
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
angular.module('scatterPlot', []);
angular.module('scatterPlot')
	.controller('scatter-plot.controller', function($scope) {
		$scope.config = {
			id: 'scatter-plot-' + parseInt(Math.random() * 1000, 10),
			class: 'scatter-plot',
			autoresize: true,
			dimensions: {
				width: 500,
				height: 500,
				maxWidth: 700,
				maxHeight: 500,
				margin: {
					top: 40,
					left: 50,
					right: 40,
					bottom: 50
				}
			},
			tooltip: {
				offset: {
					x: 10,
					y: 10
				},
				format: function(player, labels, stats, color) {
					var header = '<tr class="header"><th colspan="2"><span class="course-color" style="background-color: ' + color + '"></span>' + player + '</th></tr>';
					var body = '';

					for (var i = 0; i < labels.length; i++) {
						body += '<tr class="body"><td class="course">' + labels[i] + '</td><td class="grade">' + stats[i] + '</td></tr>';
					}

					return '<table>' + header + body + '</table>';
				}
			},
			svg: {
				backgroundColor: '#D8B4AB',
				borderRadius: '5px',
				border: '3px solid #796560',
				marginLeft: 'auto',
				marginRight: 'auto'
			},
			data: {
				x: 'GP',
				y: 'MIN',
				z: 'PTS',
				label: 'Player',
				title: '2014-2015 NBA League Leaders',
				offset: {
					max: 0.2,
					min: 0.2
				},
				r: {
					max: 20,
					min: 5
				},
				ticks: {
					x: 7,
					y: 7
				},
				opacity: 0.65
			}
		};

		$scope.options = ['GP',
			'MIN',
			'PTS',
			'FGM',
			'FGA',
			'FG%',
			'3PM',
			'3PA',
			'3P%',
			'FTM',
			'FTA',
			'FT%',
			'OREB',
			'DREB',
			'REB',
			'AST',
			'STL',
			'BLK',
			'TOV',
			'EFF'
		];

		$scope.indices = {
			x: 0,
			y: 1,
			z: 2
		};

		$scope.changePrev = function(type) {
			$scope.indices[type] -= 1;
			if ($scope.indices[type] < 0) {
				$scope.indices[type] = $scope.options.length - 1;
			}
			$scope.config.data[type] = $scope.options[$scope.indices[type]];
		};

		$scope.changeNext = function(type) {
			$scope.indices[type] += 1;
			if ($scope.indices[type] > $scope.options.length - 1) {
				$scope.indices[type] = 0;
			}
			$scope.config.data[type] = $scope.options[$scope.indices[type]];
		};

		$scope.data = [{
			'Rank': 1,
			'Player': 'Russell Westbrook',
			'GP': 67,
			'MIN': 34.4,
			'PTS': 28.1,
			'FGM': 9.4,
			'FGA': 22.0,
			'FG%': 42.6,
			'3PM': 1.3,
			'3PA': 4.3,
			'3P%': 29.9,
			'FTM': 8.1,
			'FTA': 9.8,
			'FT%': 83.5,
			'OREB': 1.9,
			'DREB': 5.4,
			'REB': 7.3,
			'AST': 8.6,
			'STL': 2.1,
			'BLK': 0.2,
			'TOV': 4.4,
			'EFF': 27.7
		}, {
			'Rank': 2,
			'Player': 'James Harden',
			'GP': 81,
			'MIN': 36.8,
			'PTS': 27.4,
			'FGM': 8.0,
			'FGA': 18.1,
			'FG%': 44.0,
			'3PM': 2.6,
			'3PA': 6.9,
			'3P%': 37.5,
			'FTM': 8.8,
			'FTA': 10.2,
			'FT%': 86.8,
			'OREB': 0.9,
			'DREB': 4.7,
			'REB': 5.7,
			'AST': 7.0,
			'STL': 1.9,
			'BLK': 0.7,
			'TOV': 4.0,
			'EFF': 27.2
		}, {
			'Rank': 3,
			'Player': 'LeBron James',
			'GP': 69,
			'MIN': 36.1,
			'PTS': 25.3,
			'FGM': 9.0,
			'FGA': 18.5,
			'FG%': 48.8,
			'3PM': 1.7,
			'3PA': 4.9,
			'3P%': 35.4,
			'FTM': 5.4,
			'FTA': 7.7,
			'FT%': 71.0,
			'OREB': 0.7,
			'DREB': 5.3,
			'REB': 6.0,
			'AST': 7.4,
			'STL': 1.6,
			'BLK': 0.7,
			'TOV': 3.9,
			'EFF': 25.3
		}, {
			'Rank': 4,
			'Player': 'Anthony Davis',
			'GP': 68,
			'MIN': 36.1,
			'PTS': 24.4,
			'FGM': 9.4,
			'FGA': 17.6,
			'FG%': 53.5,
			'3PM': 0.0,
			'3PA': 0.2,
			'3P%': 8.3,
			'FTM': 5.5,
			'FTA': 6.8,
			'FT%': 80.5,
			'OREB': 2.5,
			'DREB': 7.7,
			'REB': 10.2,
			'AST': 2.2,
			'STL': 1.5,
			'BLK': 2.9,
			'TOV': 1.4,
			'EFF': 30.3
		}, {
			'Rank': 5,
			'Player': 'DeMarcus Cousins',
			'GP': 59,
			'MIN': 34.1,
			'PTS': 24.1,
			'FGM': 8.4,
			'FGA': 18.1,
			'FG%': 46.7,
			'3PM': 0.0,
			'3PA': 0.1,
			'3P%': 25.0,
			'FTM': 7.2,
			'FTA': 9.2,
			'FT%': 78.2,
			'OREB': 3.1,
			'DREB': 9.5,
			'REB': 12.7,
			'AST': 3.6,
			'STL': 1.5,
			'BLK': 1.8,
			'TOV': 4.3,
			'EFF': 27.6
		}, {
			'Rank': 6,
			'Player': 'Stephen Curry',
			'GP': 80,
			'MIN': 32.7,
			'PTS': 23.8,
			'FGM': 8.2,
			'FGA': 16.8,
			'FG%': 48.7,
			'3PM': 3.6,
			'3PA': 8.1,
			'3P%': 44.3,
			'FTM': 3.9,
			'FTA': 4.2,
			'FT%': 91.4,
			'OREB': 0.7,
			'DREB': 3.6,
			'REB': 4.3,
			'AST': 7.7,
			'STL': 2.0,
			'BLK': 0.2,
			'TOV': 3.1,
			'EFF': 25.9
		}, {
			'Rank': 7,
			'Player': 'LaMarcus Aldridge',
			'GP': 71,
			'MIN': 35.4,
			'PTS': 23.4,
			'FGM': 9.3,
			'FGA': 19.9,
			'FG%': 46.6,
			'3PM': 0.5,
			'3PA': 1.5,
			'3P%': 35.2,
			'FTM': 4.3,
			'FTA': 5.1,
			'FT%': 84.5,
			'OREB': 2.5,
			'DREB': 7.7,
			'REB': 10.2,
			'AST': 1.7,
			'STL': 0.7,
			'BLK': 1.0,
			'TOV': 1.7,
			'EFF': 23.8
		}, {
			'Rank': 8,
			'Player': 'Blake Griffin',
			'GP': 67,
			'MIN': 35.2,
			'PTS': 21.9,
			'FGM': 8.6,
			'FGA': 17.1,
			'FG%': 50.2,
			'3PM': 0.1,
			'3PA': 0.4,
			'3P%': 40.0,
			'FTM': 4.6,
			'FTA': 6.4,
			'FT%': 72.8,
			'OREB': 1.9,
			'DREB': 5.7,
			'REB': 7.6,
			'AST': 5.3,
			'STL': 0.9,
			'BLK': 0.5,
			'TOV': 2.3,
			'EFF': 23.7
		}, {
			'Rank': 9,
			'Player': 'Kyrie Irving',
			'GP': 75,
			'MIN': 36.4,
			'PTS': 21.7,
			'FGM': 7.7,
			'FGA': 16.5,
			'FG%': 46.8,
			'3PM': 2.1,
			'3PA': 5.0,
			'3P%': 41.5,
			'FTM': 4.2,
			'FTA': 4.9,
			'FT%': 86.3,
			'OREB': 0.7,
			'DREB': 2.4,
			'REB': 3.2,
			'AST': 5.2,
			'STL': 1.5,
			'BLK': 0.3,
			'TOV': 2.5,
			'EFF': 19.9
		}, {
			'Rank': 10,
			'Player': 'Klay Thompson',
			'GP': 77,
			'MIN': 31.9,
			'PTS': 21.7,
			'FGM': 7.8,
			'FGA': 16.9,
			'FG%': 46.3,
			'3PM': 3.1,
			'3PA': 7.1,
			'3P%': 43.9,
			'FTM': 2.9,
			'FTA': 3.3,
			'FT%': 87.9,
			'OREB': 0.4,
			'DREB': 2.9,
			'REB': 3.2,
			'AST': 2.9,
			'STL': 1.1,
			'BLK': 0.8,
			'TOV': 1.9,
			'EFF': 18.3
		}, {
			'Rank': 11,
			'Player': 'Dwyane Wade',
			'GP': 62,
			'MIN': 31.8,
			'PTS': 21.5,
			'FGM': 8.2,
			'FGA': 17.5,
			'FG%': 47.0,
			'3PM': 0.5,
			'3PA': 1.6,
			'3P%': 28.4,
			'FTM': 4.6,
			'FTA': 6.0,
			'FT%': 76.8,
			'OREB': 0.9,
			'DREB': 2.6,
			'REB': 3.5,
			'AST': 4.8,
			'STL': 1.2,
			'BLK': 0.3,
			'TOV': 3.4,
			'EFF': 17.3
		}, {
			'Rank': 12,
			'Player': 'Rudy Gay',
			'GP': 68,
			'MIN': 35.4,
			'PTS': 21.1,
			'FGM': 7.5,
			'FGA': 16.4,
			'FG%': 45.5,
			'3PM': 1.2,
			'3PA': 3.2,
			'3P%': 35.9,
			'FTM': 5.0,
			'FTA': 5.8,
			'FT%': 85.8,
			'OREB': 1.4,
			'DREB': 4.4,
			'REB': 5.9,
			'AST': 3.7,
			'STL': 1.0,
			'BLK': 0.6,
			'TOV': 2.7,
			'EFF': 19.8
		}, {
			'Rank': 13,
			'Player': 'Damian Lillard',
			'GP': 82,
			'MIN': 35.7,
			'PTS': 21.0,
			'FGM': 7.2,
			'FGA': 16.6,
			'FG%': 43.4,
			'3PM': 2.4,
			'3PA': 7.0,
			'3P%': 34.3,
			'FTM': 4.2,
			'FTA': 4.9,
			'FT%': 86.4,
			'OREB': 0.6,
			'DREB': 4.0,
			'REB': 4.6,
			'AST': 6.2,
			'STL': 1.2,
			'BLK': 0.3,
			'TOV': 2.7,
			'EFF': 20.5
		}, {
			'Rank': 14,
			'Player': 'DeMar DeRozan',
			'GP': 60,
			'MIN': 35.0,
			'PTS': 20.1,
			'FGM': 6.8,
			'FGA': 16.5,
			'FG%': 41.3,
			'3PM': 0.4,
			'3PA': 1.5,
			'3P%': 28.4,
			'FTM': 6.0,
			'FTA': 7.2,
			'FT%': 83.2,
			'OREB': 0.7,
			'DREB': 3.9,
			'REB': 4.6,
			'AST': 3.5,
			'STL': 1.2,
			'BLK': 0.2,
			'TOV': 2.3,
			'EFF': 16.4
		}, {
			'Rank': 15,
			'Player': 'Jimmy Butler',
			'GP': 65,
			'MIN': 38.7,
			'PTS': 20.0,
			'FGM': 6.5,
			'FGA': 14.0,
			'FG%': 46.2,
			'3PM': 1.1,
			'3PA': 3.0,
			'3P%': 37.8,
			'FTM': 5.9,
			'FTA': 7.1,
			'FT%': 83.4,
			'OREB': 1.8,
			'DREB': 4.1,
			'REB': 5.8,
			'AST': 3.3,
			'STL': 1.8,
			'BLK': 0.6,
			'TOV': 1.4,
			'EFF': 21.2
		}, {
			'Rank': 16,
			'Player': 'Nikola Vucevic',
			'GP': 74,
			'MIN': 34.2,
			'PTS': 19.3,
			'FGM': 8.5,
			'FGA': 16.3,
			'FG%': 52.3,
			'3PM': 0.0,
			'3PA': 0.1,
			'3P%': 33.3,
			'FTM': 2.2,
			'FTA': 2.9,
			'FT%': 75.2,
			'OREB': 3.2,
			'DREB': 7.7,
			'REB': 10.9,
			'AST': 2.0,
			'STL': 0.7,
			'BLK': 0.7,
			'TOV': 2.0,
			'EFF': 23.2
		}, {
			'Rank': 17,
			'Player': 'Gordon Hayward',
			'GP': 76,
			'MIN': 34.4,
			'PTS': 19.3,
			'FGM': 6.4,
			'FGA': 14.3,
			'FG%': 44.5,
			'3PM': 1.6,
			'3PA': 4.3,
			'3P%': 36.4,
			'FTM': 4.9,
			'FTA': 6.1,
			'FT%': 81.2,
			'OREB': 0.7,
			'DREB': 4.2,
			'REB': 4.9,
			'AST': 4.1,
			'STL': 1.4,
			'BLK': 0.4,
			'TOV': 2.7,
			'EFF': 18.3
		}, {
			'Rank': 18,
			'Player': 'Chris Paul',
			'GP': 82,
			'MIN': 34.8,
			'PTS': 19.1,
			'FGM': 6.9,
			'FGA': 14.3,
			'FG%': 48.5,
			'3PM': 1.7,
			'3PA': 4.3,
			'3P%': 39.8,
			'FTM': 3.5,
			'FTA': 3.9,
			'FT%': 90.0,
			'OREB': 0.6,
			'DREB': 4.0,
			'REB': 4.6,
			'AST': 10.2,
			'STL': 1.9,
			'BLK': 0.2,
			'TOV': 2.3,
			'EFF': 25.9
		}, {
			'Rank': 19,
			'Player': 'Monta Ellis',
			'GP': 80,
			'MIN': 33.7,
			'PTS': 18.9,
			'FGM': 7.5,
			'FGA': 16.9,
			'FG%': 44.5,
			'3PM': 1.0,
			'3PA': 3.6,
			'3P%': 28.5,
			'FTM': 2.9,
			'FTA': 3.8,
			'FT%': 75.2,
			'OREB': 0.4,
			'DREB': 2.0,
			'REB': 2.4,
			'AST': 4.1,
			'STL': 1.9,
			'BLK': 0.3,
			'TOV': 2.5,
			'EFF': 14.8
		}, {
			'Rank': 20,
			'Player': 'Pau Gasol',
			'GP': 78,
			'MIN': 34.4,
			'PTS': 18.5,
			'FGM': 7.3,
			'FGA': 14.8,
			'FG%': 49.4,
			'3PM': 0.2,
			'3PA': 0.3,
			'3P%': 46.2,
			'FTM': 3.8,
			'FTA': 4.7,
			'FT%': 80.3,
			'OREB': 2.8,
			'DREB': 9.0,
			'REB': 11.8,
			'AST': 2.7,
			'STL': 0.3,
			'BLK': 1.9,
			'TOV': 2.0,
			'EFF': 24.8
		}, {
			'Rank': 21,
			'Player': 'Victor Oladipo',
			'GP': 72,
			'MIN': 35.7,
			'PTS': 17.9,
			'FGM': 6.6,
			'FGA': 15.1,
			'FG%': 43.6,
			'3PM': 1.2,
			'3PA': 3.4,
			'3P%': 33.9,
			'FTM': 3.6,
			'FTA': 4.4,
			'FT%': 81.9,
			'OREB': 0.7,
			'DREB': 3.5,
			'REB': 4.2,
			'AST': 4.1,
			'STL': 1.7,
			'BLK': 0.3,
			'TOV': 2.8,
			'EFF': 16.0
		}, {
			'Rank': 22,
			'Player': 'Kyle Lowry',
			'GP': 70,
			'MIN': 34.5,
			'PTS': 17.8,
			'FGM': 6.1,
			'FGA': 14.9,
			'FG%': 41.2,
			'3PM': 1.9,
			'3PA': 5.6,
			'3P%': 33.8,
			'FTM': 3.6,
			'FTA': 4.5,
			'FT%': 80.8,
			'OREB': 0.8,
			'DREB': 3.9,
			'REB': 4.7,
			'AST': 6.8,
			'STL': 1.6,
			'BLK': 0.2,
			'TOV': 2.5,
			'EFF': 18.9
		}, {
			'Rank': 23,
			'Player': 'John Wall',
			'GP': 79,
			'MIN': 35.9,
			'PTS': 17.6,
			'FGM': 6.6,
			'FGA': 14.8,
			'FG%': 44.5,
			'3PM': 0.8,
			'3PA': 2.7,
			'3P%': 30.0,
			'FTM': 3.6,
			'FTA': 4.6,
			'FT%': 78.5,
			'OREB': 0.5,
			'DREB': 4.2,
			'REB': 4.6,
			'AST': 10.0,
			'STL': 1.8,
			'BLK': 0.6,
			'TOV': 3.9,
			'EFF': 21.5
		}, {
			'Rank': 24,
			'Player': 'Marc Gasol',
			'GP': 81,
			'MIN': 33.2,
			'PTS': 17.4,
			'FGM': 6.5,
			'FGA': 13.2,
			'FG%': 49.4,
			'3PM': 0.0,
			'3PA': 0.2,
			'3P%': 17.6,
			'FTM': 4.3,
			'FTA': 5.4,
			'FT%': 79.5,
			'OREB': 1.4,
			'DREB': 6.4,
			'REB': 7.8,
			'AST': 3.8,
			'STL': 0.9,
			'BLK': 1.6,
			'TOV': 2.2,
			'EFF': 21.5
		}, {
			'Rank': 25,
			'Player': 'Kemba Walker',
			'GP': 62,
			'MIN': 34.2,
			'PTS': 17.3,
			'FGM': 6.1,
			'FGA': 15.8,
			'FG%': 38.5,
			'3PM': 1.4,
			'3PA': 4.5,
			'3P%': 30.4,
			'FTM': 3.8,
			'FTA': 4.6,
			'FT%': 82.7,
			'OREB': 0.6,
			'DREB': 3.0,
			'REB': 3.5,
			'AST': 5.1,
			'STL': 1.4,
			'BLK': 0.5,
			'TOV': 1.6,
			'EFF': 15.8
		}, {
			'Rank': 26,
			'Player': 'Dirk Nowitzki',
			'GP': 77,
			'MIN': 29.6,
			'PTS': 17.3,
			'FGM': 6.3,
			'FGA': 13.8,
			'FG%': 45.9,
			'3PM': 1.4,
			'3PA': 3.6,
			'3P%': 38.0,
			'FTM': 3.3,
			'FTA': 3.8,
			'FT%': 88.2,
			'OREB': 0.6,
			'DREB': 5.4,
			'REB': 5.9,
			'AST': 1.9,
			'STL': 0.5,
			'BLK': 0.4,
			'TOV': 1.1,
			'EFF': 17.1
		}, {
			'Rank': 27,
			'Player': 'Brook Lopez',
			'GP': 72,
			'MIN': 29.2,
			'PTS': 17.2,
			'FGM': 7.0,
			'FGA': 13.7,
			'FG%': 51.3,
			'3PM': 0.0,
			'3PA': 0.1,
			'3P%': 10.0,
			'FTM': 3.1,
			'FTA': 3.8,
			'FT%': 81.4,
			'OREB': 3.0,
			'DREB': 4.5,
			'REB': 7.4,
			'AST': 0.7,
			'STL': 0.6,
			'BLK': 1.8,
			'TOV': 1.4,
			'EFF': 18.8
		}, {
			'Rank': 28,
			'Player': 'Tobias Harris',
			'GP': 68,
			'MIN': 34.8,
			'PTS': 17.1,
			'FGM': 6.5,
			'FGA': 14.0,
			'FG%': 46.6,
			'3PM': 1.3,
			'3PA': 3.5,
			'3P%': 36.4,
			'FTM': 2.8,
			'FTA': 3.6,
			'FT%': 78.8,
			'OREB': 1.1,
			'DREB': 5.3,
			'REB': 6.3,
			'AST': 1.8,
			'STL': 1.0,
			'BLK': 0.5,
			'TOV': 1.7,
			'EFF': 16.9
		}, {
			'Rank': 29,
			'Player': 'Eric Bledsoe',
			'GP': 81,
			'MIN': 34.6,
			'PTS': 17.0,
			'FGM': 5.8,
			'FGA': 12.9,
			'FG%': 44.7,
			'3PM': 1.1,
			'3PA': 3.4,
			'3P%': 32.4,
			'FTM': 4.4,
			'FTA': 5.4,
			'FT%': 80.0,
			'OREB': 0.9,
			'DREB': 4.3,
			'REB': 5.2,
			'AST': 6.1,
			'STL': 1.6,
			'BLK': 0.6,
			'TOV': 3.4,
			'EFF': 18.8
		}, {
			'Rank': 30,
			'Player': 'Brandon Knight',
			'GP': 63,
			'MIN': 32.3,
			'PTS': 17.0,
			'FGM': 6.0,
			'FGA': 14.1,
			'FG%': 42.2,
			'3PM': 2.0,
			'3PA': 5.1,
			'3P%': 38.9,
			'FTM': 3.1,
			'FTA': 3.5,
			'FT%': 87.4,
			'OREB': 0.4,
			'DREB': 3.4,
			'REB': 3.9,
			'AST': 5.2,
			'STL': 1.4,
			'BLK': 0.2,
			'TOV': 3.0,
			'EFF': 16.1
		}, {
			'Rank': 31,
			'Player': 'Andrew Wiggins',
			'GP': 82,
			'MIN': 36.2,
			'PTS': 16.9,
			'FGM': 6.1,
			'FGA': 13.9,
			'FG%': 43.7,
			'3PM': 0.5,
			'3PA': 1.5,
			'3P%': 31.0,
			'FTM': 4.3,
			'FTA': 5.7,
			'FT%': 76.0,
			'OREB': 1.6,
			'DREB': 2.9,
			'REB': 4.6,
			'AST': 2.1,
			'STL': 1.1,
			'BLK': 0.6,
			'TOV': 2.2,
			'EFF': 13.9
		}, {
			'Rank': 32,
			'Player': 'Paul Millsap',
			'GP': 73,
			'MIN': 32.7,
			'PTS': 16.7,
			'FGM': 6.1,
			'FGA': 12.7,
			'FG%': 47.6,
			'3PM': 1.1,
			'3PA': 3.0,
			'3P%': 35.6,
			'FTM': 3.5,
			'FTA': 4.6,
			'FT%': 75.7,
			'OREB': 1.9,
			'DREB': 5.9,
			'REB': 7.8,
			'AST': 3.1,
			'STL': 1.8,
			'BLK': 0.9,
			'TOV': 2.3,
			'EFF': 20.2
		}, {
			'Rank': 33,
			'Player': 'Al Jefferson',
			'GP': 65,
			'MIN': 30.6,
			'PTS': 16.6,
			'FGM': 7.5,
			'FGA': 15.5,
			'FG%': 48.1,
			'3PM': 0.0,
			'3PA': 0.1,
			'3P%': 40.0,
			'FTM': 1.7,
			'FTA': 2.5,
			'FT%': 65.5,
			'OREB': 1.5,
			'DREB': 6.9,
			'REB': 8.4,
			'AST': 1.7,
			'STL': 0.7,
			'BLK': 1.3,
			'TOV': 1.1,
			'EFF': 18.8
		}, {
			'Rank': 34,
			'Player': 'Tyreke Evans',
			'GP': 79,
			'MIN': 34.1,
			'PTS': 16.6,
			'FGM': 6.6,
			'FGA': 14.7,
			'FG%': 44.7,
			'3PM': 0.9,
			'3PA': 2.9,
			'3P%': 30.4,
			'FTM': 2.6,
			'FTA': 3.7,
			'FT%': 69.4,
			'OREB': 1.0,
			'DREB': 4.2,
			'REB': 5.3,
			'AST': 6.6,
			'STL': 1.3,
			'BLK': 0.5,
			'TOV': 3.1,
			'EFF': 17.8
		}, {
			'Rank': 35,
			'Player': 'Kawhi Leonard',
			'GP': 64,
			'MIN': 31.8,
			'PTS': 16.5,
			'FGM': 6.2,
			'FGA': 12.8,
			'FG%': 47.9,
			'3PM': 1.0,
			'3PA': 3.0,
			'3P%': 34.9,
			'FTM': 3.2,
			'FTA': 3.9,
			'FT%': 80.2,
			'OREB': 1.3,
			'DREB': 5.9,
			'REB': 7.2,
			'AST': 2.5,
			'STL': 2.3,
			'BLK': 0.8,
			'TOV': 1.5,
			'EFF': 20.3
		}, {
			'Rank': 36,
			'Player': 'Isaiah Thomas',
			'GP': 67,
			'MIN': 25.8,
			'PTS': 16.4,
			'FGM': 5.0,
			'FGA': 11.9,
			'FG%': 42.1,
			'3PM': 1.9,
			'3PA': 5.2,
			'3P%': 37.3,
			'FTM': 4.5,
			'FTA': 5.2,
			'FT%': 86.8,
			'OREB': 0.5,
			'DREB': 1.8,
			'REB': 2.3,
			'AST': 4.2,
			'STL': 0.8,
			'BLK': 0.1,
			'TOV': 2.1,
			'EFF': 14.2
		}, {
			'Rank': 37,
			'Player': 'Kevin Love',
			'GP': 75,
			'MIN': 33.8,
			'PTS': 16.4,
			'FGM': 5.5,
			'FGA': 12.7,
			'FG%': 43.4,
			'3PM': 1.9,
			'3PA': 5.2,
			'3P%': 36.7,
			'FTM': 3.4,
			'FTA': 4.3,
			'FT%': 80.4,
			'OREB': 1.9,
			'DREB': 7.9,
			'REB': 9.7,
			'AST': 2.2,
			'STL': 0.7,
			'BLK': 0.5,
			'TOV': 1.6,
			'EFF': 19.9
		}, {
			'Rank': 38,
			'Player': 'JJ Redick',
			'GP': 78,
			'MIN': 30.9,
			'PTS': 16.4,
			'FGM': 5.7,
			'FGA': 12.0,
			'FG%': 47.7,
			'3PM': 2.6,
			'3PA': 5.9,
			'3P%': 43.7,
			'FTM': 2.3,
			'FTA': 2.6,
			'FT%': 90.1,
			'OREB': 0.3,
			'DREB': 1.9,
			'REB': 2.1,
			'AST': 1.8,
			'STL': 0.5,
			'BLK': 0.1,
			'TOV': 1.2,
			'EFF': 13.1
		}, {
			'Rank': 39,
			'Player': 'Goran Dragic',
			'GP': 78,
			'MIN': 33.8,
			'PTS': 16.3,
			'FGM': 6.4,
			'FGA': 12.8,
			'FG%': 50.1,
			'3PM': 1.2,
			'3PA': 3.3,
			'3P%': 34.7,
			'FTM': 2.3,
			'FTA': 3.0,
			'FT%': 77.4,
			'OREB': 1.0,
			'DREB': 2.5,
			'REB': 3.5,
			'AST': 4.5,
			'STL': 1.0,
			'BLK': 0.2,
			'TOV': 2.2,
			'EFF': 16.2
		}, {
			'Rank': 40,
			'Player': 'Zach Randolph',
			'GP': 71,
			'MIN': 32.5,
			'PTS': 16.1,
			'FGM': 6.4,
			'FGA': 13.1,
			'FG%': 48.7,
			'3PM': 0.1,
			'3PA': 0.3,
			'3P%': 35.0,
			'FTM': 3.2,
			'FTA': 4.2,
			'FT%': 76.5,
			'OREB': 3.2,
			'DREB': 7.4,
			'REB': 10.5,
			'AST': 2.2,
			'STL': 1.0,
			'BLK': 0.2,
			'TOV': 2.2,
			'EFF': 20.0
		}, {
			'Rank': 41,
			'Player': 'Derrick Favors',
			'GP': 74,
			'MIN': 30.8,
			'PTS': 16.0,
			'FGM': 6.5,
			'FGA': 12.4,
			'FG%': 52.5,
			'3PM': 0.0,
			'3PA': 0.1,
			'3P%': 16.7,
			'FTM': 3.0,
			'FTA': 4.5,
			'FT%': 66.9,
			'OREB': 2.6,
			'DREB': 5.6,
			'REB': 8.2,
			'AST': 1.5,
			'STL': 0.8,
			'BLK': 1.7,
			'TOV': 1.6,
			'EFF': 19.2
		}, {
			'Rank': 42,
			'Player': 'Wesley Matthews',
			'GP': 60,
			'MIN': 33.7,
			'PTS': 15.9,
			'FGM': 5.6,
			'FGA': 12.5,
			'FG%': 44.8,
			'3PM': 2.9,
			'3PA': 7.4,
			'3P%': 38.9,
			'FTM': 1.8,
			'FTA': 2.4,
			'FT%': 75.2,
			'OREB': 0.6,
			'DREB': 3.1,
			'REB': 3.7,
			'AST': 2.3,
			'STL': 1.3,
			'BLK': 0.2,
			'TOV': 1.4,
			'EFF': 14.5
		}, {
			'Rank': 43,
			'Player': 'Jeff Teague',
			'GP': 73,
			'MIN': 30.5,
			'PTS': 15.9,
			'FGM': 5.6,
			'FGA': 12.2,
			'FG%': 46.0,
			'3PM': 1.0,
			'3PA': 2.8,
			'3P%': 34.3,
			'FTM': 3.8,
			'FTA': 4.4,
			'FT%': 86.2,
			'OREB': 0.4,
			'DREB': 2.1,
			'REB': 2.5,
			'AST': 7.0,
			'STL': 1.7,
			'BLK': 0.4,
			'TOV': 2.8,
			'EFF': 17.6
		}, {
			'Rank': 44,
			'Player': 'Greg Monroe',
			'GP': 69,
			'MIN': 31.0,
			'PTS': 15.9,
			'FGM': 6.1,
			'FGA': 12.4,
			'FG%': 49.6,
			'3PM': 0.0,
			'3PA': 0.0,
			'3P%': 0.0,
			'FTM': 3.7,
			'FTA': 4.9,
			'FT%': 75.0,
			'OREB': 3.3,
			'DREB': 6.9,
			'REB': 10.2,
			'AST': 2.1,
			'STL': 1.1,
			'BLK': 0.5,
			'TOV': 2.2,
			'EFF': 20.2
		}, {
			'Rank': 45,
			'Player': 'Mike Conley',
			'GP': 70,
			'MIN': 31.8,
			'PTS': 15.8,
			'FGM': 5.6,
			'FGA': 12.6,
			'FG%': 44.6,
			'3PM': 1.5,
			'3PA': 4.0,
			'3P%': 38.6,
			'FTM': 3.1,
			'FTA': 3.6,
			'FT%': 85.9,
			'OREB': 0.4,
			'DREB': 2.6,
			'REB': 3.0,
			'AST': 5.4,
			'STL': 1.3,
			'BLK': 0.2,
			'TOV': 2.2,
			'EFF': 15.9
		}, {
			'Rank': 46,
			'Player': 'Jamal Crawford',
			'GP': 64,
			'MIN': 26.6,
			'PTS': 15.8,
			'FGM': 5.2,
			'FGA': 13.1,
			'FG%': 39.6,
			'3PM': 1.9,
			'3PA': 5.7,
			'3P%': 32.7,
			'FTM': 3.5,
			'FTA': 3.9,
			'FT%': 90.1,
			'OREB': 0.3,
			'DREB': 1.7,
			'REB': 1.9,
			'AST': 2.5,
			'STL': 0.9,
			'BLK': 0.2,
			'TOV': 1.4,
			'EFF': 11.6
		}, {
			'Rank': 47,
			'Player': 'Chandler Parsons',
			'GP': 66,
			'MIN': 33.1,
			'PTS': 15.7,
			'FGM': 5.8,
			'FGA': 12.6,
			'FG%': 46.2,
			'3PM': 2.0,
			'3PA': 5.3,
			'3P%': 38.0,
			'FTM': 2.1,
			'FTA': 2.9,
			'FT%': 72.0,
			'OREB': 1.0,
			'DREB': 3.9,
			'REB': 4.9,
			'AST': 2.4,
			'STL': 1.1,
			'BLK': 0.3,
			'TOV': 1.4,
			'EFF': 15.3
		}, {
			'Rank': 48,
			'Player': 'Lou Williams',
			'GP': 80,
			'MIN': 25.2,
			'PTS': 15.5,
			'FGM': 4.7,
			'FGA': 11.6,
			'FG%': 40.4,
			'3PM': 1.9,
			'3PA': 5.6,
			'3P%': 34.0,
			'FTM': 4.3,
			'FTA': 4.9,
			'FT%': 86.1,
			'OREB': 0.3,
			'DREB': 1.6,
			'REB': 1.9,
			'AST': 2.1,
			'STL': 1.1,
			'BLK': 0.1,
			'TOV': 1.3,
			'EFF': 11.8
		}, {
			'Rank': 49,
			'Player': 'Enes Kanter',
			'GP': 75,
			'MIN': 28.5,
			'PTS': 15.5,
			'FGM': 6.4,
			'FGA': 12.4,
			'FG%': 51.9,
			'3PM': 0.2,
			'3PA': 0.6,
			'3P%': 35.6,
			'FTM': 2.4,
			'FTA': 3.1,
			'FT%': 78.2,
			'OREB': 3.7,
			'DREB': 5.3,
			'REB': 8.9,
			'AST': 0.7,
			'STL': 0.5,
			'BLK': 0.4,
			'TOV': 1.9,
			'EFF': 17.5
		}, {
			'Rank': 50,
			'Player': 'Markieff Morris',
			'GP': 82,
			'MIN': 31.5,
			'PTS': 15.3,
			'FGM': 6.2,
			'FGA': 13.4,
			'FG%': 46.5,
			'3PM': 0.7,
			'3PA': 2.2,
			'3P%': 31.8,
			'FTM': 2.2,
			'FTA': 2.8,
			'FT%': 76.3,
			'OREB': 1.3,
			'DREB': 4.8,
			'REB': 6.2,
			'AST': 2.3,
			'STL': 1.2,
			'BLK': 0.5,
			'TOV': 2.1,
			'EFF': 15.6
		}];
	});
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
angular.module('app', 
	['ngAnimate',
	'common',
	'lineGraph',
	'scatterPlot']);
angular.module('app')
  .controller('appController', ['$scope', '$timeout', function($scope, $timeout) {

    var fullName = [{
      name: 'Shen',
      delay: '0s'
    }, {
      name: 'Jin',
      delay: '50ms'
    }];

    var content = [{
      name: 'Resume',
      link: 'assets/ShenJinResume.pdf',
      target: '_blank',
      delay: '0ms'
    }, {
      name: 'GitHub',
      link: 'https://github.com/SJ119/',
      target: '_blank',
      delay: '25ms'
    }, {
      name: 'LinkedIn',
      link: 'https://www.linkedin.com/in/shenjin',
      target: '_blank',
      delay: '50ms'
    }, {
      name: 'Projects',
      link: '#',
      target: '',
      delay: '75ms'
    }, {
      name: 'Graphs',
      link: '#',
      target: '',
      delay: '100ms'
    }];

    $scope.changePage = function(page) {
      if (page === 'Graphs') {

        $timeout(function() {
          $scope.mainPage = false;
          $timeout(function() {
            $scope.contentPage = true;
          }, 500);
        }, 500);
        $scope.graphs = 'Graphs';
        $scope.back = 'Back';


      } else if (page === 'Projects') {

        $timeout(function() {
          $scope.mainPage = false;
          $timeout(function() {
            $scope.contentPage = true;
          }, 500);
        }, 500);
        $scope.projects = 'Projects';
        $scope.back = 'Back';

      } else if (page === 'Back') {

        $scope.back = '';
        $scope.projects = '';
        $scope.graphs = '';
        $timeout(function() {
          $scope.contentPage = false;
          $timeout(function() {
            $scope.mainPage = true;
          }, 500);
        }, 500);
      }
    };

    $timeout(function() {
      $scope.fullName = fullName;
      $scope.content = content;
      $scope.mainPage = true;
      $scope.contentPage = false;
      $scope.back = '';
      $scope.projects = '';
      $scope.graphs = '';
    });

    $scope.myProjects = {
      games: {
        spaceGame: {
          name: 'Space Game',
          img: 'assets/images/spaceGameThumb.png',
          link: 'https://github.com/SJ119/SpaceGame'
        },
        doubleFlap: {
          name: 'Double Flap',
          img: 'assets/images/Double\ Flap.png',
          link: 'https://github.com/SJ119/DoubleFlap'
        },
        corners: {
          name: 'Corners',
          img: 'assets/images/4Corners.png',
          link: 'https://github.com/SJ119/Corners'
        },
        minionMash: {
          name: 'Minion Mash',
          img: 'assets/images/MinionMash.png',
          link: 'https://github.com/SJ119/MinionMash'
        }
      }
    };

  }]);