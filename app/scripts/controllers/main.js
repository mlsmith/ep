'use strict';

angular.module('etherpokerApp')
  .controller('MainCtrl', function ($scope, $timeout, $http, Socket) {
    // var PokerEvaluator = require('poker-evaluator');
    // Get player ID from separate API (hardcoded for demo)

    Socket.on('gameState', function (game) {
      console.log(game);
      $scope.game = game;
      $scope.newWager = $scope.minBet = game.blinds[1] * 2;
    });


    function chipsWagered (wager, player) {
      var blinds = $scope.game.blinds,
          chipSizes = [
            blinds[1] * 3,
            blinds[1] * 2,
            blinds[1],
            blinds[0],
            1
          ],
          wager = parseInt(wager),
          player = parseInt(player),
          colors = ['black', 'green', 'red', 'blue', 'orange'],
          column = -1,
          chipDistribution = [], position;

      for (var i = 0; i < chipSizes.length; i++) {
        if (chipSizes[i] <= wager && wager > 0) {
          column++;
          for (var j = 0, len = Math.floor(wager/chipSizes[i]); j < len; j ++){
            position = (player === 0) ? 'right:' : 'left:';
            chipDistribution.push({
              type: i,
              amt: chipSizes[i],
              style: 'bottom: '+j+'px;' +position+(column*17)+'px; background-color: '+colors[i]+';'
            });
            wager -= chipSizes[i];
          }
        }
      }
      return chipDistribution;
    }


    $scope.$watch('game.actionOn', function (actionOn) {
      if (actionOn === 0) {
        $scope.showActions = true;
      } else {
        $scope.showActions = false;
      }
    });

    $scope.$watch('game.highestWager', function (newHighest, prevHighest){
      if (newHighest){
        prevHighest = prevHighest || 0;
        $scope.newWager = (newHighest * 2) - $scope.game.players[0].currentWager;
      }
    })

    $scope.$watch('game.players[1].currentWager', function (currentWager, prevWager) {
      if (currentWager) {
        $scope.pile1 = chipsWagered(currentWager, 1);
      } else {
        $scope.pile1 = null;
      }
    });

    $scope.$watch('game.players[0].currentWager', function (currentWager, prevWager) {
    	if (currentWager) {
        $scope.pile0 = chipsWagered(currentWager, 0);
    	} else {
        $scope.pile0 = null;
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
      updateScope (amount)
    };


    $scope.call = function (amount) {
      amount = parseInt(amount);
    	Socket.emit('action', {
    		type: 'call',
    		player: 0,
    		amount: amount
    	});
      updateScope (amount)
    };
    $scope.bet = function (amount) {
      amount = parseInt(amount);
    	Socket.emit('action', {
    		type: 'bet',
    		player: 0,
    		amount: amount
    	});
      updateScope (amount)
    };
    $scope.raise = function (amount) {
      amount = parseInt(amount);
    	Socket.emit('action', {
    		type: 'raise',
    		player: 0,
    		amount: amount
    	});
      updateScope (amount)
    };

    function updateScope (amount) {
      if (amount){
        amount = parseInt(amount);
        $scope.game.players[0].currentWager = amount;
        $scope.game.players[0].chips -= amount;
      }
      $scope.game.actionOn = 1;
    }

    function showHands () {
    	$scope.showHands = true;
    	$timeout(function(){
    		$scope.showHands = false;
    	}, 3000);
    }

  });
