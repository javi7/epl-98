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
        $scope.teamStats = teams;
        var ownerMap = {};
        for (var teamIdx = 0; teamIdx < teams.length; teamIdx += 1) {
          var team = teams[teamIdx];
          if (ownerMap[team.owner._id] === undefined) {
            ownerMap[team.owner._id] = {
              'name': team.owner.name,
              'points': 0,
              'wins': 0,
              'losses': 0,
              'draws': 0,
              'goalsFor': 0,
              'goalsAgainst': 0
            };
          }
          ownerMap[team.owner._id].points += team.points; 
          ownerMap[team.owner._id].wins += team.wins; 
          ownerMap[team.owner._id].losses += team.losses; 
          ownerMap[team.owner._id].draws += team.draws; 
          ownerMap[team.owner._id].goalsFor += team.goalsFor; 
          ownerMap[team.owner._id].goalsAgainst += team.goalsAgainst; 
        }
        $scope.ownerStats = [];
        for (var key in ownerMap) {
          if (ownerMap.hasOwnProperty(key)) {
            $scope.ownerStats.push(ownerMap[key]);
          }
        }
        $scope.teams = $scope.teamStats;
        $scope.inactiveView = 'owners';
      }
    );
  };

  $scope.toggleStandings = function() {
    if ($scope.teams === $scope.teamStats) {
      $scope.teams = $scope.ownerStats;
      $scope.inactiveView = 'teams';
    } else {
      $scope.teams = $scope.teamStats;
      $scope.inactiveView = 'owners';
    }
  };
}]);