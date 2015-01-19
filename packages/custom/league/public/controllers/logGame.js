'use strict';

angular.module('mean.league').controller('LogGameController', ['$scope', '$compile', '$http', '$location', 'Global', 'Teams', 'Games', 'Players',
  function($scope, $compile, $http, $location, Global, Teams, Games, Players) {
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
          $scope.game = {'home': {}, 'away': {}};
          if ($location.search().home && $location.search().away && findTeamByName($location.search().home) && findTeamByName($location.search().away)) {
            $scope.game.home.team = findTeamByName($location.search().home);
            $scope.game.away.team = findTeamByName($location.search().away);
          } 
        }
      );
    };

    $scope.addGameEvent = function(inputTeam) {
      if ($scope.game[inputTeam].team === undefined) {
        alert('please pick yo squad first\nLove,\nDat nerd kurtis');
      } else {
        var eventInput = angular.element(
          '<div class="form-group game-event-' + inputTeam + '"> \
             <div class="col-sm-5">  \
              <select ng-model="game.' + inputTeam + '.events[' + $scope.eventCount[inputTeam] + '].eventType" name="' + inputTeam + '-event-type-' + $scope.eventCount[inputTeam] + '" class="form-control">  \
                <option>goal</option>  \
                <option>yellow card</option>  \
                <option>red card</option>  \
                <option>own goal</option>  \
              </select>  \
            </div>  \
            <div class="col-sm-7">  \
              <input auto-complete ui-items="game.' + inputTeam + '.players" ng-model="game.' + inputTeam + '.events[' + $scope.eventCount[inputTeam] + '].player" name="' + inputTeam + '-event-player-' + $scope.eventCount[inputTeam] + '" class="form-control" placeholder="player">  \
            </div>  \
          </div>'
        );
        
        $('#' + inputTeam + '-events').append(eventInput);
        $compile(eventInput)($scope);
        $scope.eventCount[inputTeam] += 1;
      }
    };

    $scope.logGame = function() {
      var game = {'teams': [], 'played': true};
      game.teams.push(_convertAngularTeamToMongooseTeam($scope.game.home, true));
      game.teams.push(_convertAngularTeamToMongooseTeam($scope.game.away, false));
      if (game.teams.length !== 2) {
        alert('error parsing team names!');
      } else {
        Games.update(
          game, 
          function() {
            window.location.href= '/#!league/logGame';
            window.location.reload();
          }, 
          function(err) {
            alert(err.data);
          }
        );
      }
    };

    $scope.loadPlayers = function(inputTeam) {
      Players.query(
        {'teamId': $scope.game[inputTeam].team._id},
        function(players) {
          $scope.game[inputTeam].players=players;
        }
      );
      $('.game-event-' + inputTeam).remove();
    };

    var _convertAngularTeamToMongooseTeam = function(angularTeam, isHome) {
      var mongooseTeam = {'events': []};
      mongooseTeam.goals = angularTeam.score;
      mongooseTeam.home = isHome;
      mongooseTeam.teamId = angularTeam.team._id;
      for (var eventIdx in angularTeam.events) {
        var angularEvent = angularTeam.events[eventIdx];
        if (angularEvent.eventType && angularEvent.player) {
          mongooseTeam.events.push({'eventType': angularEvent.eventType, 'player': angularEvent.player});
        }
      }
      return mongooseTeam;
    };

    var findTeamByName = function(teamName) {
      for (var teamIdx in $scope.teams) {
        if ($scope.teams[teamIdx].name === teamName) {
          return $scope.teams[teamIdx];
        }
      }
      return -1;
    };
  }
]);