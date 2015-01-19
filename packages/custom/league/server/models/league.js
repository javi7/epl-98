'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * League Schema
 */
var SuspensionSchema = new Schema({
  player: {
    type: String,
    required: true
  },
  dateSuspended: {
    type: Date,
    required: true
  }
});

var TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  }, 
  draws: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  goalsFor: {
    type: Number,
    default: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0
  },
  suspensions: [SuspensionSchema],
  lastGamePlayed: {
    type: Date,
    default: 0
  }
});

var gameEvents = ['yellow card', 'red card', 'goal', 'own goal'];

var GameEventSchema = new Schema({
  eventType: {
    type: String,
    enum: gameEvents,
    required: true
  },
  player : {
    type: String,
    required: true
  }
});

var TeamResultSchema = new Schema({
  teamId: {
    type: Schema.ObjectId,
    ref: 'Team',
    required: true
  },
  home: {
    type: Boolean,
    required: true
  },
  goals: {
    type: Number,
    default: 0
  },
  events: [GameEventSchema]
});

var GameSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  teams: [TeamResultSchema],
  played: {
    type: Boolean,
    default: false
  },
  datePlayed: {
    type: Date
  }
});

var PlayerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  teamId: {
    type: Schema.ObjectId,
    ref: 'Team',
    required: true
  },
  goals: {
    type: Number,
    default: 0
  },
  yellows: {
    type: Number,
    default: 0
  },
  reds: {
    type: Number,
    default: 0
  },
  ownGoals: {
    type: Number,
    default: 0
  }
});

/**
 * Validations
 */
GameSchema.path('teams').validate(function(teams) {
  return teams.length === 2;
}, 'Must be two teams present');

/**
 * Statics
 */

TeamSchema.statics.load = function(teamName, cb) {
  this.findOne({
    name: teamName
  }).exec(cb);
};

TeamSchema.statics.findTeamsForOwner = function(ownerId, cb) {
  this.find({
    owner: ownerId
  }).exec(cb);
};

GameSchema.statics.load = function(gameId, cb) {
  this.findOne({
    _id: gameId
  }).populate('teams.teamId').exec(cb);
};

GameSchema.statics.findAllMatchesBetweenTeams = function(teamSets, cb) {
  this.find({})
    .and([
      {'teams': {'$elemMatch': {'teamId': teamSets[0]}}},
      {'teams': {'$elemMatch': {'teamId': teamSets[1]}}},
    ])
    .exec(cb);
};

GameSchema.statics.findRecentOrUpcomingMatchupBetweenTeams = function(teamSets, cb) {
  var now = new Date();
  var startSearch = new Date().setDate(now.getDate() - 4);
  var endSearch = new Date().setDate(now.getDate() + 3);

  this.find({})
    .where('date').gte(startSearch).lte(endSearch)
    .where('played').equals(false)
    .and([
      {'teams': {'$elemMatch': {'teamId': {'$in': teamSets[0]}}}},
      {'teams': {'$elemMatch': {'teamId': {'$in': teamSets[1]}}}},
    ])
    .sort('date').populate('teams.teamId').exec(cb);
};

GameSchema.statics.findEarliestUnplayedMatchupBetweenTeams = function(teamSets, cb) {
  this.findOne({})
    .where('played').equals(false)
    .and([
      {'teams': {'$elemMatch': {'teamId': {'$in': teamSets[0]}}}},
      {'teams': {'$elemMatch': {'teamId': {'$in': teamSets[1]}}}},
    ])
    .sort('date').populate('teams.teamId').exec(cb);
};

PlayerSchema.statics.findAllPlayersForTeam = function(teamId, cb) {
  this.find({})
    .where('teamId').equals(teamId).exec(cb);
};

mongoose.model('Team', TeamSchema);
mongoose.model('Game', GameSchema);
mongoose.model('Player', PlayerSchema);
