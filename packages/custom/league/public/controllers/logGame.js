'use strict';

angular.module('mean.league').controller('LogGameController', ['$scope', '$compile', '$http', 'Global', 'Teams', 'Games',
  function($scope, $compile, $http,  Global, Teams, Games) {
    $scope.global = Global;
    $scope.package = {
      name: 'league'
    };

    $scope.gameInputPage = function() {
      Teams.query(
        {}, 
        function(teams) {
          $scope.teams=teams;
          $scope.inputTeams = ['home', 'away'];
          $scope.eventCount = {'home': 0, 'away': 0};
        }
      );
    };

    $scope.addGameEvent = function(inputTeam) {
      var eventInput = angular.element(
        '<div class="form-group"> \
           <div class="col-sm-5">  \
            <select ng-model="game.' + inputTeam + '.events[' + $scope.eventCount[inputTeam] + '].eventType" name="' + inputTeam + '-event-type-' + $scope.eventCount[inputTeam] + '" class="form-control">  \
              <option>goal</option>  \
              <option>yellow card</option>  \
              <option>red card</option>  \
              <option>own goal</option>  \
            </select>  \
          </div>  \
          <div class="col-sm-7">  \
            <input ng-model="game.' + inputTeam + '.events[' + $scope.eventCount[inputTeam] + '].player" name="' + inputTeam + '-event-player-' + $scope.eventCount[inputTeam] + '" class="form-control" placeholder="player">  \
          </div>  \
        </div>'
      );
      
      $('#' + inputTeam + '-events').append(eventInput);
      $compile(eventInput)($scope);
      $scope.eventCount[inputTeam] += 1;
    };

    $scope.logGame = function() {
      var game = {'teams': [], 'played': true};
      game.teams.push(_convertAngularTeamToMongooseTeam($scope.game.home, true));
      game.teams.push(_convertAngularTeamToMongooseTeam($scope.game.away, false));
      if (game.teams.length !== 2) {
        alert('error parsing team names!');
      } else {
        Games.update(game);
      }
    };

    var _convertAngularTeamToMongooseTeam = function(angularTeam, isHome) {
      var mongooseTeam = {'events': []};
      mongooseTeam.goals = angularTeam.score;
      mongooseTeam.home = isHome;
      for (var eventIdx in angularTeam.events) {
        mongooseTeam.events.push({'eventType': angularTeam.events[eventIdx].eventType, 'player': angularTeam.events[eventIdx].player});
      }
      for (var teamIdx in $scope.teams) {
        if ($scope.teams[teamIdx].name === angularTeam.team) {
          mongooseTeam.teamId = $scope.teams[teamIdx]._id;
          break;
        }
      }
      return mongooseTeam;
    };
  }
]);
