'use strict';

angular.module('mean.league').controller('FindGameController', ['$scope', '$http', 'Global', 'Teams', 'Games', 'Owners',
  function($scope, $http, Global, Teams, Games, Owners) {
    $scope.global = Global;
    $scope.package = {
      name: 'league'
    };
    $scope.game = '';

    $scope.init = function() {
      Owners.query(
        {},
        function(owners) {
          $scope.owners = owners;
        }
      );
    };

    $scope.findGame = function() {
      $scope.game = '';
      $http.get('/findMatchup?owners=' + $scope.owner1 + '&owners=' + $scope.owner2)
        .success(function(data, status, headers, config) {
          $scope.game = data[0];
        })
        .error(function(data, status, headers, config) {});
    };
  }
]);