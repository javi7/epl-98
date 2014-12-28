'use strict';

angular.module('mean.league').factory('Teams', ['$resource',
  function($resource) {
    return $resource('team/:teamId', {
      teamId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
