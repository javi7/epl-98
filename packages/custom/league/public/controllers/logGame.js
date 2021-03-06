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
          $scope.game = {'home': {'events': []}, 'away': {'events': []}};
          if ($location.search().home && $location.search().away && findTeamByName($location.search().home) && findTeamByName($location.search().away)) {
            $scope.game.home.team = findTeamByName($location.search().home);
            $scope.game.away.team = findTeamByName($location.search().away);
            $scope.loadPlayers('home');
            $scope.loadPlayers('away');
          } 
        }
      );
    };

    $scope.addGameEvent = function(inputTeam) {
      if ($scope.game[inputTeam].team === undefined) {
        alert('please pick yo squad first\nLove,\nDat nerd kurtis');
      } else {
        $scope.game[inputTeam].events.push({'eventType': '', 'player': ''});
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
      Players.forTeam(
        {'teamId': $scope.game[inputTeam].team._id},
        function(players) {
          $scope.game[inputTeam].players=players;
        }
      );
      $scope.game[inputTeam].events = [];
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