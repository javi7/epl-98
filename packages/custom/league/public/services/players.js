'use strict';

angular.module('mean.league').factory('Players', ['$resource',
  function($resource) {
    return $resource('players/:ownerId', {
    }, {});
  }
]);