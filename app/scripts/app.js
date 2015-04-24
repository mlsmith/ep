'use strict';

/**
 * @ngdoc overview
 * @name etherpokerApp
 * @description
 * # etherpokerApp
 *
 * Main module of the application.
 */
angular
  .module('etherpokerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
