'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Team = mongoose.model('Team');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};

exports.all = function(req, res) {
  Team.find().populate('owner').exec(function(err, teams) {
    if (err) {
      return res.json(500, {
        error: 'fucked up grabbing dem squads'
      });
    }
    res.json(teams);
  });
};