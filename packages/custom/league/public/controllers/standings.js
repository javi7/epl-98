'use strict';

angular.module('mean.league').controller('StandingsController', ['$scope', 'Global', 'Teams',
  function($scope, Global, Teams){
    $scope.global = Global;
    $scope.package = {
      name: 'league'
    };
  
  $scope.init = function() {
    Teams.query(
      {},
      function(teams) {
        $scope.teams = teams;
      }
    );
  };
}]);