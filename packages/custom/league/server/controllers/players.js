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