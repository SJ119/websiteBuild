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
        $scope.grades = '';
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
      $scope.grades = '';
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
      // ,
      // web: {
      //   personalBudget: {
      //     name: 'Budget',
      //     link: '',
      //     target: '_blank'
      //   },
      //   calculator: {
      //     name: 'Calculator (tip/tax/grade calculator)',
      //     link: '',
      //     target: '_blank'
      //   },
      //   average: {
      //     name: 'AverageCalculator (grade calculator)',
      //     link: '',
      //     target: '_blank'
      //   },
      //   todo: {
      //     name: 'Todo List (maybe put calendar)',
      //     link: '',
      //     target: '_blank'
      //   },
      //   nutrition: {
      //     name: 'Nutrition stats (graphs and charts of nutrition values',
      //     link: '',
      //     target: 'traget="_blank"'
      //   }
      // },
      // apps: {
      //   watchApp: {
      //     name: 'iPhone battery complication'
      //   }
      // }
    };

  }]);