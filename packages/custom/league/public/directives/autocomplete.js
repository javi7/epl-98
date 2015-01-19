'use strict';

angular.module('mean.league').directive('autoComplete', function($timeout) {
  return function(scope, iElement, iAttrs) {
    var keyArray = iAttrs.uiItems.split('.');
    var items = scope;
    for (var keyIdx = 0; keyIdx < keyArray.length; keyIdx += 1) {
      items = items[keyArray[keyIdx]];
    }
    iElement.autocomplete({
      source: items.map(function(element) {
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