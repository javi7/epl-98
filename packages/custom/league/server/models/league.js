'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Review Schema
 */
var TeamSchema = new Schema({
  name: {
    type: String,
    required: true
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
  }
});

var gameEvents = ['yellow', 'red', 'goal', 'own goal'];

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

 /* TO-DO */

mongoose.model('Team', TeamSchema);
mongoose.model('Game', GameSchema);
