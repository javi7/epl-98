'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Team = mongoose.model('Team'),
  Game = mongoose.model('Game'),
  async = require('async'),
  url = require('url');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};

exports.createTeam = function(req, res) {
  var team = new Team(req.body);

  team.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Error saving the team'
      });
    }
    res.json(team);
  });
};

exports.createMatchup = function(req, res) {
  var date = req.body.date;
  var home = req.body.home;
  var away = req.body.away;

  var gameObj = {'date': date, 'teams':[]};

  console.log('retrieving ids for home/away teams ' + home + '/' + away);

  async.parallel([
    function(callback) {Team.load(home, function(err, id) {
        gameObj.teams.push({'teamId': id._id, 'home': true});
        console.log('found home id ' + id._id);
        callback();
      });
    },
    function(callback) {Team.load(away, function(err, id) {
        gameObj.teams.push({'teamId': id._id, 'home': false});
        console.log('found away id ' + id._id);
        callback();
      });
    }
  ], function(err, results) { 

    var game = new Game(gameObj);

    console.log('game created -- ' + JSON.stringify(game));

    game.save(function(err) {
      if (err) {
        return res.json(500, {error: 'error saving the matchup'});
      }
      res.json(game);
    });
  }
  );
};

exports.findMatchup = function(req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  console.log(JSON.stringify(query));
  var teamSets = [];

  async.each(query.owners, function(owner, callback) {
      Team.findTeamsForOwner(owner, function(err, teams) {
        teamSets.push(teams.map( function(element) { return element._id; }));
        callback();
      });
    }, function(err) {
      Game.findRecentOrUpcomingMatchupBetweenTeams(teamSets, function(err, matchups) {
        if (err) {
          res.json(500, {error: 'fucked up finding recent games'});
        }
        Game.findEarliestUnplayedMatchupBetweenTeams(teamSets, function(err, matchup) {
          if (err) {
            res.json(500, {error: 'fucked up finding early game'});
          }
          matchups.push(matchup);
          res.json(matchups);
        });
      });
    }
  );
};