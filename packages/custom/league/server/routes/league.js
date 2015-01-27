'use strict';

var league = require('../controllers/league.js');
var teams = require('../controllers/teams.js');
var games = require('../controllers/games.js');
var owners = require('../controllers/owners.js');
var players = require('../controllers/players.js');

// The Package is past automatically as first parameter
module.exports = function(League, app, auth, database) {

  // app.route('/teams').post(league.createTeam);
  // app.route('/game').post(league.createMatchup);
  app.route('/findMatchup').get(league.findMatchup);
  app.route('/team')
    .get(teams.all);
  app.route('/game')
    .get(games.all)
    .put(games.logGame);
  app.route('/owners')
    .get(owners.all);
  app.route('/players')
    .get(players.all);
  app.route('/pythonPlayers')
    .put(players.createOrIncrement);
  app.route('/team/:teamId/players')
    .get(players.findAllPlayersForTeam);
};
