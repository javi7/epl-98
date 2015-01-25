'use strict';

angular.module('mean.league').filter('owner', [function() {
  return function(input) {
    switch(input) {
      case 'Geoff Brown':
        return '(Gian)';
      case 'Javi Muhrer':
        return '(Javi)';
      case 'Alex Zorn':
        return '(Zorn)';
      case 'Jordan Rand':
        return '(JBland)';
      default:
        return '';
    }
  };
}]);