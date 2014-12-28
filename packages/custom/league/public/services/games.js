'use strict';

angular.module('mean.league').factory('Games', ['$resource',
  function($resource) {
    return $resource('game/:gameId', {}, 
    {
      update: {
        method: 'PUT'
      }
    });
  }
]);
