'use strict';

angular.module('mean.league').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('league example page', {
      url: '/league/example',
      templateUrl: 'league/views/index.html'
    });
  }
]);
