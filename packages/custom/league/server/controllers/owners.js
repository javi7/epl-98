'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Owners = mongoose.model('User');

exports.all = function(req, res) {
  Owners.find({}, function(err, owners) {
    if (err) {
      res.json(500, 'we got some rats in our owners. my bad -- ' + err);
    }
    res.json(owners);
  });
};