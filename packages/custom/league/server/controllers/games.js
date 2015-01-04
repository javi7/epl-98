'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Game = mongoose.model('Game'),
  Team = mongoose.model('Team');

exports.logGame = function(req, res, next) {
  var loggedGame = req.body;

  Game.findAllMatchesBetweenTeams([loggedGame.teams[0].teamId, loggedGame.teams[1].teamId], function(err, games) {
    if (err) {
      console.log('error finding matchups\n' + err);
      res.json(500, 'fucked up finding dem games');
      return;
    }
    var matchedGame;
    var teamOneIndex;
    var teamTwoIndex;
    for (var gameIdx in games) {
      if (games[gameIdx].teams[0].home === loggedGame.teams[0].home && games[gameIdx].teams[0].teamId.toString() === loggedGame.teams[0].teamId) {
        matchedGame = games[gameIdx];
        teamOneIndex = 0;
        teamTwoIndex = 1;
        break;
      } else if (games[gameIdx].teams[1].home === loggedGame.teams[0].home && games[gameIdx].teams[1].teamId.toString() === loggedGame.teams[0].teamId) {
        matchedGame = games[gameIdx];
        teamOneIndex = 1;
        teamTwoIndex = 0;
        break;
      }
    }
    if (!matchedGame) {
      res.json(500, 'no matchup between those teams found');
      return;
    }
    if (matchedGame.played) {
      console.log('match already played!');
      res.json(500, 'game already played');
      return;
    }
    matchedGame.teams[teamOneIndex].goals = loggedGame.teams[0].goals;
    matchedGame.teams[teamOneIndex].events = loggedGame.teams[0].events;
    matchedGame.teams[teamTwoIndex].goals = loggedGame.teams[1].goals;
    matchedGame.teams[teamTwoIndex].events = loggedGame.teams[1].events;
    matchedGame.played = true;
    matchedGame.save(function(err) {
      if (err) {
        console.log('failed to save game -- ' + matchedGame + ' -- ' + err );
        res.json(500, 'error saving game -- ' + err);
      } else {
        updateStandings();
        res.send(200);
      }
    });
  });

  var updateStandings = function() {
    Team.find({}, function(err, teams) {
      if (err) {
        console.log('error retrieving teams for standings update');
      } else {
        resetStandings(teams);
        Game.find({'played': true}, function(err, games) {
          if (err) {
            console.log('error retrieving played games for standings update');
          } else {
            for (var gameIdx in games) {
              processGameForStandings(games[gameIdx], teams);
            }
            saveStandings(teams);
          }
        });
      }
    });
  };

  var saveStandings = function(teams) {
    var logError = function(team) {
      return function(err){
        if (err) {
          console.log('error saving team -- ' + teams[teamIdx]);
        }
      };
    };
    for (var teamIdx in teams) {
      teams[teamIdx].save(logError(teams[teamIdx]));
    }
  };

  var resetStandings = function(teams) {
    for (var teamIdx in teams) {
      teams[teamIdx].wins = 0;
      teams[teamIdx].losses = 0;
      teams[teamIdx].draws = 0;
      teams[teamIdx].points = 0;
      teams[teamIdx].goalsFor = 0;
      teams[teamIdx].goalsAgainst = 0;
    }
  };

  var processGameForStandings = function(game, teams) {
    for (var teamResultIdx = 0; teamResultIdx < game.teams.length; teamResultIdx += 1) {
      var teamResult = game.teams[teamResultIdx];
      var opponentResult = game.teams[1 - teamResultIdx];
      var team;
      for (var teamIdx = 0; teamIdx < teams.length; teamIdx += 1) {
        if (teams[teamIdx]._id.equals(teamResult.teamId)) {
          team = teams[teamIdx];
          break;
        }
      }
      team.goalsFor += teamResult.goals;
      team.goalsAgainst += opponentResult.goals;
      if (teamResult.goals > opponentResult.goals) {
        team.wins += 1;
        team.points += 3;
      } else if (teamResult.goals === opponentResult.goals) {
        team.draws += 1;
        team.points += 1;
      } else {
        team.losses += 1;
      }
    }
  };
};