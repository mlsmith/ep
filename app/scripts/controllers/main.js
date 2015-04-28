'use strict';

angular.module('etherpokerApp')
  .controller('MainCtrl', function ($scope, $timeout, $http, Game, Player, Socket) {
    // var PokerEvaluator = require('poker-evaluator');
  	// Get player ID from separate API (hardcoded for demo)
  	var game;

    Socket.on('gameStart', function (data) {
      console.log(data);
      game = $scope.game = data;
      $scope.newWager = $scope.minBet = game.blinds[1] * 2;
    });

    

    $scope.$watch('game.actionOn', function (actionOn) {
      console.log(actionOn);
    	if (actionOn === 0) {
    		$scope.showActions = true;
    	} else {
    		$scope.showActions = false;
    	}
    });

    $scope.$watch('game.currentWager', function (currentWager, prevWager) {
    	if (currentWager) {
    		prevWager = prevWager || 0;
    		$scope.newWager = (currentWager * 2) - prevWager;
    	}
    });

    $scope.cardImg = function (player, card) {
      return '../images/cards/' + player.hand[card] + '.png';
    }

    $scope.fold = function () {
    	Socket.emit('action', {
    		type: 'fold',
    		player: 0
    	});
    };
    $scope.check = function () {
    	Socket.emit('action', {
    		type: 'check',
    		player: 0
    	});
    };

    $scope.call = function (amount) {
    	Socket.emit('action', {
    		type: 'call',
    		player: 0,
    		amount: amount
    	});
    };
    $scope.bet = function (amount) {
    	Socket.emit('action', {
    		type: 'bet',
    		player: 0,
    		amount: amount
    	});
    };
    $scope.raise = function (amount) {
    	Socket.emit('action', {
    		type: 'raise',
    		player: 0,
    		amount: amount
    	});
    };

    function showHands () {
    	$scope.showHands = true;
    	$timeout(function(){
    		$scope.showHands = false;
    	}, 3000);
    }

  });
