'use strict';

angular.module('mean.league').controller('PlayerStatsController', ['$scope', 'Global', 'Players',
  function($scope, Global, Player){
    $scope.global = Global;
    $scope.package = {
      name: 'league'
    };
  
    $scope.init = function() {
      Player.query(
        {},
        function(players) {
          $scope.players = players;
        }
      );
    };
  }
]); 