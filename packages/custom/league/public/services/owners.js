'use strict';

angular.module('mean.league').factory('Owners', ['$resource',
  function($resource) {
    return $resource('owners/:ownerId', {
      teamId: '@_id'
    }, {});
  }
]);
