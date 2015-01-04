'use strict';

angular.module('mean.league').filter('unplayedGame', ['$sce', function($sce) {
  return function(input) {
    if (!input) {
      return '';
    }
    var homeTeam;
    var awayTeam;
    if (input.teams[0].home) {
      homeTeam = input.teams[0];
      awayTeam = input.teams[1];
    } else {
      homeTeam = input.teams[1];
      awayTeam = input.teams[0];
    }
    return $sce.trustAsHtml('<div><strong>' + 
      homeTeam.teamId.name + ' (' + homeTeam.teamId.wins + '-' + homeTeam.teamId.losses + '-' + homeTeam.teamId.draws + 
      ') v. ' + 
      awayTeam.teamId.name + ' (' + awayTeam.teamId.wins + '-' + awayTeam.teamId.losses + '-' + awayTeam.teamId.draws + 
      ')' + '</strong><a class="btn btn-default" href="/#!/league/logGame?home=' + homeTeam.teamId.name.toString() +
      '&away=' + awayTeam.teamId.name.toString() + '">log result</button></div>');
  };
}]);