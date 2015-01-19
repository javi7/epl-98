'use strict';

var mongoose = require('mongoose'),
  Player = mongoose.model('Player'),
  url = require('url');

exports.findAllPlayersForTeam = function(req, res) {
  var url_parts = url.parse(req.url, true);
  var teamId = url_parts.query.teamId;
  Player.findAllPlayersForTeam(teamId, function(err, players) {
    if (err) {
      res.json(500, {error: 'fucked up finding players for team'});
    }
    res.json(players);
  });
};