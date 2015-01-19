'use strict';

angular.module('mean.league').filter('unplayedGame', ['$sce', function($sce) {
  return function(input) {
    var suspensionsHtml = function(team) {
      var html = '<div>Suspensions: ';
      var suspensionsCount = 0;
      if (team.teamId.suspensions !== undefined) {
        for (var suspensionsIdx = 0; suspensionsIdx < team.teamId.suspensions.length; suspensionsIdx += 1) {
          var suspension = team.teamId.suspensions[suspensionsIdx];
          if (suspension.dateSuspended === team.teamId.lastGamePlayed) {
            suspensionsCount += 1;
            if (suspensionsCount > 1) {
              html += ', ';
            }
            html += suspension.player;
          }
        }
      }
      if (suspensionsCount === 0) {
        html += 'none';
      }
      html += '</div>';
      return html;
    };

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
    return $sce.trustAsHtml('<div class="row"><div class="col-md-4"><div><strong>' + 
      homeTeam.teamId.name + ' (' + homeTeam.teamId.wins + '-' + homeTeam.teamId.losses + '-' + homeTeam.teamId.draws + 
      ')</strong></div>' + suspensionsHtml(homeTeam) +
      '</div><div class="col-md-2"> v. </div><div class="col-md-4"><div><strong>' + 
      awayTeam.teamId.name + ' (' + awayTeam.teamId.wins + '-' + awayTeam.teamId.losses + '-' + awayTeam.teamId.draws + 
      ')</strong></div>' + suspensionsHtml(awayTeam) +
      '</div><div class="col-md-2"><a class="btn btn-default" href="/#!/league/logGame?home=' + homeTeam.teamId.name.toString() +
      '&away=' + awayTeam.teamId.name.toString() + '">log result</button></div></div>');
  };
}]);