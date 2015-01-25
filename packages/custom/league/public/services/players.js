'use strict';

angular.module('mean.league').factory('Players', ['$resource',
  function($resource) {
    return $resource('players', {
    }, {
      forTeam: {
        method: 'GET',
        url: 'team/:teamId/players',
        isArray: true
      }
    });
  }
]);