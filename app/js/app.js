'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/playground', {templateUrl: 'partials/playground.html', controller: 'PlaygroundController'});
  $routeProvider.when('/arena', {templateUrl: 'partials/arena.html', controller: 'ArenaController'});
  $routeProvider.when('/stats', {templateUrl: 'partials/stats.html', controller: 'StatsController'});
  $routeProvider.otherwise({redirectTo: '/playground'});
}]);
