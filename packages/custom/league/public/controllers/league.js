'use strict';

angular.module('mean.league').controller('LeagueController', ['$scope', 'Global', 'League',
  function($scope, Global, League) {
    $scope.global = Global;
    $scope.package = {
      name: 'league'
    };
  }
]);
