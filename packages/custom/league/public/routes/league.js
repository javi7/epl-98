'use strict';

angular.module('mean.league').config(['$stateProvider',
  function($stateProvider) {

    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };
    
    $stateProvider.state('log game', {
      url: '/league/logGame',
      templateUrl: 'league/views/logGame.html',
      resolve: {
        loggedin: checkLoggedin
      }
    });
    $stateProvider.state('standings', {
      url:'/league/standings',
      templateUrl: 'league/views/standings.html'
    });
    $stateProvider.state('find game', {
      url: '/league/findGame',
      templateUrl: 'league/views/findGame.html',
      resolve: {
        loggedin: checkLoggedin
      }
    });
  }
]);
