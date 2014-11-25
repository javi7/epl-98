'use strict';

// The Package is past automatically as first parameter
module.exports = function(League, app, auth, database) {

  app.get('/league/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/league/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/league/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/league/example/render', function(req, res, next) {
    League.render('index', {
      package: 'league'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
