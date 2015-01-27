'use strict';

var mongoose = require('mongoose'),
  Player = mongoose.model('Player');

exports.findAllPlayersForTeam = function(req, res) {
  var teamId = req.params.teamId;
  Player.findAllPlayersForTeam(teamId, function(err, players) {
    if (err) {
      res.json(500, {error: 'fucked up finding players for team'});
    }
    res.json(players);
  });
};

exports.all = function(req, res) {
  Player.find().exec(function(err, players) {
    if (err) {
      return res.json(500, {
        error: 'fucked up grabbing dem playaz'
      });
    }
    res.json(players);
  });
};

// TODO -- enable suspensions

var incrementEvent = function(player, incrementStat, res) {
  if (incrementStat === 'yellow card') {
      player.yellows += 1;
  } else if (incrementStat === 'red card') {
    player.reds += 1;
  } else if (incrementStat === 'goal') {
    player.goals += 1;
  } else if (incrementStat === 'own goal') {
    player.ownGoals += 1;
  }
  player.save(function(err) {
    if (err) {
      console.log('error incrementing event for player -- ' + JSON.stringify(player) + ' -- ' + incrementStat);
      return res.json(500, {error: 'fucked up incrementing player'});
    } else {
      return res.json(200, {});
    }
  });
};

var createAndUpdatePlayer = function(playerName, incrementStat, teamId, res) {
  Player.create({name: playerName, teamId: teamId}, function(err, createdPlayer) {
    if (err) {
      console.log('error creating player while processing event -- ' + JSON.stringify(playerName) + ' -- ' + err);
      return res.json(500, {error: 'fucked up creating player'});
    }
    return incrementEvent(createdPlayer, incrementStat, res);
  });
};

exports.createOrIncrement = function(req, res) {
  var playerName = req.body.playerName;
  var incrementStat = req.body.incrementStat;
  var teamId = req.body.teamId;
  Player.findOne({name: playerName, teamId: teamId}, function(err, player) {
      if (err) {
        console.log('error processing events -- ' + JSON.stringify(playerName) + ' -- ' + err);
        return res.json(500, {error: 'fucked up searching for player'});
      }
      if (!player) {
        return createAndUpdatePlayer(playerName, incrementStat, teamId, res);
      } else {
        return incrementEvent(player, incrementStat, res);
      }
    });
};

