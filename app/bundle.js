(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('etherpokerApp')
  .controller('MainCtrl', function ($scope, $timeout, Game, Player) {
    var PokerEvaluator = require('poker-evaluator');
  	// Get player ID from separate API (hardcoded for demo)
  	var playerId = 'satoshi';
    
    // Fake table API for demo
    var tableAPI = {

    	initGame: function() {
    		this.deck = freshDeck();
    		
    		var playerHand = deal(this.deck, 2),
    				opponentHand = deal(this.deck, 2),
    				players = [
			    		{
			    			id: 'satoshi',
			    			chips: 400,
			    			hand: playerHand,
			    			currentWager: 0
			    		},
			    		{
			    			id: 'szabo',
			    			chips: 500,
			    			// hidden normally
			    			hand: opponentHand,
			    			currentWager: 0
			    		}
			    	];

			  this.button = 0;
		    this.players = players;
		    this.tableCards = [];
		    this.bettingRound = 0;
		    this.button = 0;
		    this.highestWager = 0;
		    this.game = 'HUNLHE';
		    this.timeLimit = 60000;
		    this.blinds = [1,2];
		    this.history = [];

			  if (players.length < 4) {
			  	this.actionOn = this.button;
			  } else {
			  	this.actionOn = cycleIndex(cycleIndex(this.button, players.length), players.length);
			  }

    		return this;
    	},

    	newHand: function (button) {
    		this.button = cycleIndex(this.button, this.players.length);
    		this.deck = freshDeck();
    		this.players.forEach(function (player) {
    			player.totalWager = 0;
					player.hand = deal(this.deck, 2);
    		})
    	},

    	nextToAct: function () {
    		var players = this.players,
    				playerCount = players.length,
    				playerIndex = this.actionOn,
    				highestWager = this.highestWager,
    				bettingRound = this.bettingRound,
    				tableCards = this.tableCards,
    				playersLeft, player, i;

    		// If there's more actions in the round
	    	for (i = 1; i < playerCount; i++){
					playerIndex = cycleIndex(playerIndex, playerCount);
					player = players[playerIndex];

					if (player.hand && player.currentChipsWagered < highestWager) {
						this.actionOn = playerIndex;

						// simple automated strategy
						break;

					} else if (player.hand) {
						playersLeft = true;
					}
				}

				// If the round's over
				if (playersLeft && bettingRound < 3) {
					if (bettingRound === 0) {
						this.tableCards.concat(deal(this.deck, 3));
					} else {
						this.tableCards.concat(deal(this.deck, 1));
					}
					
					for (var j = 1, playerIndex = this.button; j < playerCount; j++){
						playerIndex = cycleIndex(playerIndex, playerCount);
						if (player.hand) {
							this.actionOn = playerIndex;
						}
					}

				// If the hand's over
				} else if (playersLeft){
					freshDeck();

					showHands();
				} else {
					// hide hands and pay winner
					freshDeck();
				}
    	},
    	handleAction: function (action) {
    		var playerIndex = indexOfObjWithAttr(game.players, 'id', action.player),
    				player = this.players[playerIndex],
    				log = action.player + ' ' + action.type + (action.amount ? (' ' + action.amount) : '');
    		
    		if (playerIndex === this.actionOn && (!action.amount || action.amount <= player.chips)) {
	    		if (action.type === 'fold') {
    				this.players[playerIndex].hand = [];

	    		} else if (action.type === 'check') {
	    			// nada

	    		} else if (action.type === 'call') {
	    			wager(player, action.amount);
									
	    		} else if (action.type === 'bet') {
	    			wager(player, action.amount);
	    			this.highestWager = action.amount;

	    		} else if (action.type === 'raise') {
	    			wager(player, action.amount);
	    			this.highestWager = action.amount;	    			
	    		}

	    		this.history.push(log);
					this.nextToAct();
	    	}
    	}
    }
		console.log(PokerEvaluator);

    var initGameState = tableAPI.initGame();
    
    $scope.game = new Game(initGameState);

    var playerIndex = indexOfObjWithAttr($scope.game.players, 'id', playerId);

    $scope.$watch('game.actionOn', function (actionOn) {
    	if (actionOn === playerIndex) {
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

    $scope.fold = function () {
    	tableAPI.handleAction({
    		type: 'fold',
    		player: playerId
    	});
    };
    $scope.check = function () {
    	tableAPI.handleAction({
    		type: 'check',
    		player: playerId
    	});
    };

    $scope.call = function (amount) {
    	tableAPI.handleAction({
    		type: 'call',
    		player: playerId,
    		amount: amount
    	});
    };
    $scope.bet = function (amount) {
    	tableAPI.handleAction({
    		type: 'bet',
    		player: playerId,
    		amount: amount
    	});
    };
    $scope.raise = function (amount) {
    	tableAPI.handleAction({
    		type: 'raise',
    		player: playerId,
    		amount: amount
    	});
    };


    // Paint opponent data

    // Handle player user action

    // Send player action to tableAPI

    // Get opponent reponse, repeat


    // Init game, broadcast actions, store in hh array

    // If disconnected, rebuild state with hand history


	  function cycleIndex (i, len) {
			if (i === len - 1) {
				return 0;
			} else {
				return i + 1;
			}
		}

		function wager (player, amount) {
			player.chips -= amount;
			player.currentWager += amount;
			player.totalWager += amount;
		}

    function randomIndex (array) {
    	var index = Math.floor(Math.random() * array.length);
    	return index;
    }

    function indexOfObjWithAttr (arr, key, val) {
    	for (var i = 0; i < arr.length; i++) {
    		if (arr[i][key] === val) {
    			return i;
    		}
    	}
    }

    function deal (deck, numCards) {
    	var cards = [];
    	for (var i = 0; i < numCards; i++) {
    		cards.push(deck.splice(randomIndex(deck), 1));
    	}	
    	return cards;
    }

    function freshDeck () {
    	return ['2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks', 'As', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc', 'Ac', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd', 'Ad', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh', 'Ah'];
    }

    function showHands () {
    	$scope.showHands = true;
    	$timeout(function(){
    		$scope.showHands = false;
    	}, 3000);
    }

  });

},{"poker-evaluator":3}],2:[function(require,module,exports){
//converts 3 card to lowest equivalent 5 card hand
module.exports = {
  CARDVALS: ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a'],
  CARDS: {
    "2c": 1,
    "2d": 2,
    "2h": 3,
    "2s": 4,
    "3c": 5,
    "3d": 6,
    "3h": 7,
    "3s": 8,
    "4c": 9,
    "4d": 10,
    "4h": 11,
    "4s": 12,
    "5c": 13,
    "5d": 14,
    "5h": 15,
    "5s": 16,
    "6c": 17,
    "6d": 18,
    "6h": 19,
    "6s": 20,
    "7c": 21,
    "7d": 22,
    "7h": 23,
    "7s": 24,
    "8c": 25,
    "8d": 26,
    "8h": 27,
    "8s": 28,
    "9c": 29,
    "9d": 30,
    "9h": 31,
    "9s": 32,
    "tc": 33,
    "td": 34,
    "th": 35,
    "ts": 36,
    "jc": 37,
    "jd": 38,
    "jh": 39,
    "js": 40,
    "qc": 41,
    "qd": 42,
    "qh": 43,
    "qs": 44,
    "kc": 45,
    "kd": 46,
    "kh": 47,
    "ks": 48,
    "ac": 49,
    "ad": 50,
    "ah": 51,
    "as": 52
  },

  fillHand: function(cards) {

  	var cardsUsed = [0,0,0,0,0,0,0,0,0,0,0,0,0];
  	//convert each card to vals 0-12, strip suit
  	cards.forEach(function(card) {
  		var i = Math.floor(this.CARDS[card.toLowerCase()]/4);
  		cardsUsed[i] = 1;
  	}, this);

  	var toFill = 2; //need to fill 2 cards
  	var maxFillIndex = 0; //index in cardsUsed of highest filled card

    //fill in <toFill> cards to complete 5 card hand
  	for (var i = 0; i < 13; i++) {
  	  if (toFill == 0) break; //done filling
      if (cardsUsed[i] == 0) {
        cardsUsed[i] = 2;
        maxFillIndex = i;
        toFill--;
      }
  	}

    //check if there is straight
    var continuousCards = 0;
    var hasStraight = false;
    var straightEndIndex = 0;

    for (var i = 0; i <= 13; i++) {
      if (cardsUsed[i] == 0) {
        continuousCards = 0;
      } else {
        continuousCards++;
        if (continuousCards == 5) {
          hasStraight = true;
          straightEndIndex = i;
        }
      }
    }

    //if there is straight, fix it by shifting highest filled card to one past the straight
    if (hasStraight) {
      cardsUsed[maxFillIndex] = 0;
      cardsUsed[straightEndIndex + 1] = 2;
    }

    //fill dummy cards for lowest possible hand
    var suit = ['s', 'd'];
    for (var i = 0; i <= 13; i++) {
      if (cardsUsed[i] == 2) {
        var card = this.CARDVALS[i] + suit[0];
        suit.splice(0, 1);
        cards.push(card);
      }
    }

    return cards;
  }
};
},{}],3:[function(require,module,exports){
(function (__dirname){
var fs = require("fs");
var path = require("path");
var ThreeCardConverter = require("./3CardConverter");

module.exports = {
  HANDTYPES: [
    "invalid hand",
    "high card",
    "one pair",
    "two pairs",
    "three of a kind",
    "straight",
    "flush",
    "full house",
    "four of a kind",
    "straight flush"
  ],

  CARDS: {
    "2c": 1,
    "2d": 2,
    "2h": 3,
    "2s": 4,
    "3c": 5,
    "3d": 6,
    "3h": 7,
    "3s": 8,
    "4c": 9,
    "4d": 10,
    "4h": 11,
    "4s": 12,
    "5c": 13,
    "5d": 14,
    "5h": 15,
    "5s": 16,
    "6c": 17,
    "6d": 18,
    "6h": 19,
    "6s": 20,
    "7c": 21,
    "7d": 22,
    "7h": 23,
    "7s": 24,
    "8c": 25,
    "8d": 26,
    "8h": 27,
    "8s": 28,
    "9c": 29,
    "9d": 30,
    "9h": 31,
    "9s": 32,
    "tc": 33,
    "td": 34,
    "th": 35,
    "ts": 36,
    "jc": 37,
    "jd": 38,
    "jh": 39,
    "js": 40,
    "qc": 41,
    "qd": 42,
    "qh": 43,
    "qs": 44,
    "kc": 45,
    "kd": 46,
    "kh": 47,
    "ks": 48,
    "ac": 49,
    "ad": 50,
    "ah": 51,
    "as": 52
  },

  evalHand: function(cards) {
    if (!this.ranks) {
      throw new Error("HandRanks.dat not loaded");
    }

    if (cards.length != 7 && cards.length != 5 && cards.length != 3) {
      throw new Error("Hand must be 3, 5, or 7 cards");
    }

    //if 3 card hand, fill in to make 5 card
    if (cards.length == 3) {
      cards = ThreeCardConverter.fillHand(cards);
    }

    //if passing in string formatted hand, convert first
    if (typeof cards[0] == "string") {
      cards = cards.map(function(card) {
        return this.CARDS[card.toLowerCase()];
      }.bind(this));
    }

    return this.eval(cards);
  },

  eval: function(cards) {
    var p = 53;
    for (var i = 0; i < cards.length; i++) {
      p = this.evalCard(p + cards[i]);
    }

    if (cards.length == 5) {
      p = this.evalCard(p)
    }

    return {
      handType: p >> 12,
      handRank: p & 0x00000fff,
      value: p,
      handName: this.HANDTYPES[p >> 12]
    }
  },

  evalCard: function(card) {
    return this.ranks.readUInt32LE(card * 4);
  }
}

var ranksFile = path.join(__dirname, '../data/HandRanks.dat');
module.exports.ranks = fs.readFileSync(ranksFile);

}).call(this,"/node_modules/poker-evaluator/lib")
},{"./3CardConverter":2,"fs":4,"path":5}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":6}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
