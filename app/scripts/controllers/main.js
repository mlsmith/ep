'use strict';

angular.module('etherpokerApp')
  .controller('MainCtrl', function ($scope, $rootScope, $timeout, $http, Socket) {

    Socket.on('gameState', function (gameUpdate) {
      // $timeout(function(){
        updateState.call(null, gameUpdate.table);
      // }, gameUpdate.delay);
    });


    function updateState (newState) {
      if (newState) {
        $scope.game = newState;
        displaySlider(newState);
        highestWagerUpdate(newState.highestWager);
      }
    }

    $scope.$watch('game.handComplete', function (handComplete){
      if (handComplete) {
        if (handComplete.winner === 0){
          console.log('herro');
          $scope.potPile = chipsWagered($scope.game.pot, 'right');
        } else {
          $scope.potPile = chipsWagered($scope.game.pot, 'left');
        }
        $scope.potLocation = 'chips-' + handComplete.winner;
        if (handComplete.showdown) {
          $scope.game.players[1].hand = handComplete.showdown;
        }
      } else {
        $scope.potLocation = 'pot';
      }
    })


    function chipsWagered (wager, position) {
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
            chipDistribution.push({
              type: i,
              amt: chipSizes[i],
              style: 'bottom: '+j+'px;' +position+':'+(column*17)+'px; background-color: '+colors[i]+';'
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
        
        var game = $scope.game, 
            player = game.players[0];
      } else {
        $scope.showActions = false;
      }
    });

    $scope.$watch('game.highestWager', function (newHighest){
      highestWagerUpdate(newHighest);
    });

    function highestWagerUpdate (newHighest) {
      var game = $scope.game;
      if (game) {
        var player = game.players[0],
            currentWager = player.currentWager,
            offset = currentWager >= game.blinds[1] ? currentWager : 0; 
        $scope.callAmount = Math.min(player.chips, newHighest - currentWager);
        if (newHighest === currentWager) {
          $scope.newWager = Math.min(player.chips, game.blinds[1]);
        } else {
          $scope.newWager = Math.min(player.chips, (newHighest * 2) - currentWager);
        }

        if (newHighest - currentWager < player.chips && game.actionOn === 0) {
          $scope.showSlider = true;
        } else {
          $scope.showSlider = false;
        }
        $scope.minBet = $scope.newWager;
      }
    }

    $scope.$watch('game.pot', function (currentPot) {
      if (currentPot) {
        if (!$scope.game.handComplete){
          $scope.potPile = chipsWagered(currentPot, 'left');
        }
      } else {
        $scope.potPile = null;
      }
    });
    $scope.$watch('game.players[1].currentWager', function (currentWager, prevWager) {
      if (currentWager) {
        $scope.pile1 = chipsWagered(currentWager, 'left');
      } else {
        $scope.pile1 = null;
      }
    });

    $scope.$watch('game.players[0].currentWager', function (currentWager, prevWager) {
    	if (currentWager) {
        $scope.pile0 = chipsWagered(currentWager, 'right');
    	} else {
        $scope.pile0 = null;
      }
    });


    $scope.cardImg = function (player, card) {
      return '../images/cards/' + player.hand[card] + '.png';
    }

    $scope.callAmount = function () {
      var game = $scope.game,
          player = game.players[0];
      return Math.min(player.chips, game.highestWager - player.currentWager);
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
      updateScope();
    };


    $scope.call = function () {
      var game = $scope.game,
          player = game.players[0];
      var totalToCover = parseInt(game.highestWager - player.currentWager),
          totalCoverable = Math.min(player.chips, totalToCover);
    	
      Socket.emit('action', {
    		type: 'call',
    		player: 0,
    		amount: totalCoverable
    	});
      updateScope(totalCoverable);
    };
    $scope.bet = function (amount) {
      amount = parseInt(amount);
    	Socket.emit('action', {
    		type: 'bet',
    		player: 0,
    		amount: amount
    	});
      updateScope(amount);
    };
    $scope.raise = function (amount) {
      amount = parseInt(amount);
    	Socket.emit('action', {
    		type: 'raise',
    		player: 0,
    		amount: amount
    	});
      updateScope(amount);
    };

    function updateScope (amount) {
      if (amount){
        amount = parseInt(amount);
        $scope.game.players[0].currentWager += amount;
        $scope.game.players[0].chips -= amount;
      }
      $scope.game.actionOn = 1;
    }

    function displaySlider (game) {
      var playersWithChips = 0;
      game.players.forEach(function(player){
        if (player.chips) playersWithChips++;
      });
      $scope.showSlider = playersWithChips > 1;
    }

    function showHands () {
    	$scope.showHands = true;
    	$timeout(function(){
    		$scope.showHands = false;
    	}, 3000);
    }

  });
