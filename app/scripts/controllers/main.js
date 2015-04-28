'use strict';

angular.module('etherpokerApp')
  .controller('MainCtrl', function ($scope, $timeout, $http, Socket) {
    // var PokerEvaluator = require('poker-evaluator');
    // Get player ID from separate API (hardcoded for demo)
    var game;

    Socket.on('gameStart', function (data) {
      console.log(data);
      game = $scope.game = data;
      $scope.newWager = $scope.minBet = game.blinds[1] * 2;
    });




    function chipsWagered (wager) {
      var blinds = $scope.game.blinds,
          chipSizes = [
            blinds[1] * 3,
            blinds[1] * 2,
            blinds[1],
            blinds[0],
            1
          ];

      return distributeChips(chipSizes, parseInt(wager));
    }



    function distributeChips (chipSizes, wager) {
      console.log(chipSizes, wager);
      var chipDistribution = [],
          colors = ['black', 'green', 'red', 'blue', 'orange'],
          column = -1;
      for (var i = 0; i < chipSizes.length; i++) {
        if (chipSizes[i] <= wager && wager > 0) {
          column++;
          for (var j = 0, len = Math.floor(wager/chipSizes[i]); j < len; j ++){
            chipDistribution.push({
              type: i,
              amt: chipSizes[i],
              style: 'bottom: '+j+'px; right: '+(column*17)+'px; background-color: '+colors[i]+';'
            });
            wager -= chipSizes[i];
            console.log(wager);
          }
        }
      }
      console.log(chipDistribution);
      return chipDistribution;
    }

    $scope.$watch('game.actionOn', function (actionOn) {
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
      $scope.pile = chipsWagered(amount);
      console.log('pile', $scope.pile);
    };
    $scope.raise = function (amount) {
    	Socket.emit('action', {
    		type: 'raise',
    		player: 0,
    		amount: amount
    	});

      $scope.pile = chipsWagered(amount);
    };

    function showHands () {
    	$scope.showHands = true;
    	$timeout(function(){
    		$scope.showHands = false;
    	}, 3000);
    }

  });
