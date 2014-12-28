'use strict';

var league = require('../controllers/league.js');
var teams = require('../controllers/teams.js');
var games = require('../controllers/games.js');

// The Package is past automatically as first parameter
module.exports = function(League, app, auth, database) {

  // app.route('/teams').post(league.createTeam);
  // app.route('/game').post(league.createMatchup);
  app.route('/findMatchup').get(league.findMatchup);
  app.route('/team')
    .get(teams.all);
  app.route('/game')
    .put(games.logGame);
};
