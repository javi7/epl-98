'use strict';

angular.module('mean.league').directive('autoComplete', function($timeout) {
  return function(scope, iElement, iAttrs) {
    iElement.autocomplete({
      source: scope.$parent[iAttrs.uiItems].map(function(element) {
        return element.name;
      }),
      select: function() {
        $timeout(function() {
          iElement.trigger('input');
        }, 0);
      }
    });
  };
});