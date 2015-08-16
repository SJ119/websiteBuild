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