'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Game = mongoose.model('Game'),
  Team = mongoose.model('Team'),
  Player = mongoose.model('Player'),
  async = require('async');

exports.all = function(req, res) {
  Game.find({'played': true}).exec(function(err, games) {
    if (err) {
      return res.json(500, {
        error: 'fucked up grabbing dem games'
      });
    }
    res.json(games);
  });
};

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
    for (var gameIdx = 0; gameIdx < games.length; gameIdx += 1) {
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
    var datePlayed = new Date();
    matchedGame.datePlayed = datePlayed;
    matchedGame.save(function(err) {
      if (err) {
        console.log('failed to save game -- ' + matchedGame + ' -- ' + err );
        res.json(500, 'error saving game -- ' + err);
      } else {
        async.series([
          function(callback) {
            console.log('PROCESSING EVENTS');
            processEvents(matchedGame, callback);
          },
          function(callback) {
            console.log('UPDATING STANDINGS');
            updateStandings(callback);
          }
        ],
        function(err, results) {
          if (err) {
            res.sendStatus(400);
            console.log(err);
          } else {
            res.sendStatus(200);
          }
        });
      }
    });
  });

  var processEvents = function(game, callback) {
    /*jshint -W083 */

    var updatePlayerEvents = function(playerEvents, playerCallback) {
      console.log('UPDATING EVENTS FOR PLAYER ' + playerEvents.events[0].player);
      findOrCreateAndUpdatePlayer(playerEvents, playerEvents.teamId, playerCallback);
    };

    var processEventsForTeam = function(team, teamCallback) {
      console.log('PROCESSING EVENTS FOR ' + team);
      var playerEventMap = {};
      for (var eventIdx = 0; eventIdx < team.events.length; eventIdx += 1) {
        var playerEvent = team.events[eventIdx];
        console.log('PROCESSING EVENT ' + playerEvent);
        if (playerEventMap[playerEvent.player] === undefined) {
          console.log('PLAYER NOT IN MAP, ADDING ' + playerEvent.player);
          playerEventMap[playerEvent.player] = {teamId: team.teamId, events: [], gameDate: game.datePlayed};
        }
        playerEventMap[playerEvent.player].events.push(playerEvent);
      }
      console.log('player event map created: ' + playerEventMap);
      var playerEventMapValues = [];
      for (var key in playerEventMap) {
        playerEventMapValues.push(playerEventMap[key]);
      }
      async.each(playerEventMapValues, updatePlayerEvents, function(err) {
        if (err) {
          teamCallback(err);
        } else {
          teamCallback();
        }
      });
    };

    async.each(game.teams, processEventsForTeam, function(err) {
      if (err) {
        callback(err);
      } else {
        callback();
      }
    });
  };

  var findOrCreateAndUpdatePlayer = function(playerEvents, teamId, playerCallback) {
    console.log('finding/creating player -- ' + playerEvents + ' -- ' + teamId);
    Player.findOne({name: playerEvents.events[0].player, teamId: teamId}, function(err, player) {
      if (err) {
        console.log('error processing events -- ' + JSON.stringify(playerEvents) + ' -- ' + err);
        playerCallback(err);
      }
      if (!player) {
        createAndUpdatePlayer(playerEvents, teamId, playerCallback);
      } else {
        incrementEvents(player, playerEvents, playerCallback);
      }
    });
  };

  var createAndUpdatePlayer = function(playerEvents, teamId, playerCallback) {
    Player.create({name: playerEvents.events[0].player, teamId: teamId}, function(err, createdPlayer) {
      if (err) {
        console.log('error creating player while processing event -- ' + JSON.stringify(playerEvents) + ' -- ' + err);
      }
      incrementEvents(createdPlayer, playerEvents, playerCallback);
    });
  };

  var incrementEvents = function(player, playerEvents, playerCallback) {
    var suspended = false;
    for (var eventIdx = 0; eventIdx < playerEvents.events.length; eventIdx += 1) {
      var eventType = playerEvents.events[eventIdx].eventType;
      if (eventType === 'yellow card') {
        player.yellows += 1;
        if (player.yellows % 5 === 0) {
          suspended = true;
        }
      } else if (eventType === 'red card') {
        player.reds += 1;
        suspended = true;
      } else if (eventType === 'goal') {
        player.goals += 1;
      } else if (eventType === 'own goal') {
        player.ownGoals += 1;
      }
    }
    player.save(function(err) {
      if (err) {
        console.log('error incrementing event for player -- ' + JSON.stringify(player) + ' -- ' + eventType);
        playerCallback(err);
      } else {
        if (suspended) {
          suspendPlayer(player, playerEvents.gameDate, playerCallback);
        } else {
          playerCallback();
        }
      }
    });
  };

  var updateStandings = function(callback) {
    Team.find({}, function(err, teams) {
      if (err) {
        console.log('error retrieving teams for standings update -- ' + err);
        callback(err);
      } else {
        resetStandings(teams);
        Game.find({'played': true}, null, {sort: {datePlayed : 1}}, function(err, games) {
          if (err) {
            console.log('error retrieving played games for standings update -- ' + err);
            callback(err);
          } else {
            for (var gameIdx = 0; gameIdx < games.length; gameIdx += 1) {
              processGameForStandings(games[gameIdx], teams);
            }
            saveStandings(teams, callback);
          }
        });
      }
    });
  };

  var saveStandings = function(teams, standingsCallback) {
    var saveTeam = function(team, saveCallback) {
      team.save(function(err){
        if (err) {
          console.log('error saving team -- ' + team + ' -- ' + err);
          saveCallback(err);
        } else {
          saveCallback();
        }
      });
    };
    async.each(teams, saveTeam, function(err) {
      if (err) {
        standingsCallback(err);
      } else {
        standingsCallback();
      }
    });
  };

  var resetStandings = function(teams) {
    for (var teamIdx in teams) {
      teams[teamIdx].wins = 0;
      teams[teamIdx].losses = 0;
      teams[teamIdx].draws = 0;
      teams[teamIdx].points = 0;
      teams[teamIdx].goalsFor = 0;
      teams[teamIdx].goalsAgainst = 0;
      //teams[teamIdx].suspensions = [];
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
      team.lastGamePlayed = game.datePlayed;
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
    // game.played=false;
    // game.datePlayed=undefined;
    // for (var teamIdx = 0; teamIdx < game.teams.length; teamIdx += 1) {
    //   game.teams[teamIdx].goals = 0;
    //   game.teams[teamIdx].events = [];
    // }
    // game.save();
  };

  var suspendPlayer = function(player, gameDate, suspensionCallback) {
    Team.findOne({_id: player.teamId}, function(err, team){
      if (err) {
        console.log('error loading team to suspend a dude -- ' + player);
        suspensionCallback(err);
      } else {
        if (!team.suspensions) {
          team.suspensions = [];
        }
        team.suspensions.push({player: player.name, dateSuspended: gameDate});
        team.save(function(err) {
          if (err) {
            console.log('error saving suspension 4 dude -- ' + player + ' -- ' + team);
            suspensionCallback(err);
          } else {
            suspensionCallback();
          }
        });
      }
    });
  };
};