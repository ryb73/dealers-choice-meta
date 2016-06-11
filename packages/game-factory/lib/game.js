"use strict";

const nodeUuid  = require("node-uuid"),
      BeginningState = require("dc-game-states").BeginningState,
      GameData       = require("dc-engine").GameData;

function Game($players, $deckConfig, $choiceProvider) {
  let uuid = nodeUuid.v1();
  let choiceProvider, gameData, state;

  function initialize() {
    choiceProvider = $choiceProvider;

    gameData = new GameData($players, $deckConfig);
    state = new BeginningState(gameData, choiceProvider);

    $players = $deckConfig = $choiceProvider = null;
  }

  // Returns promise for boolean:
  //  true if game should continue
  //  false if game is over
  function doNext() {
    return state.go()
      .then(function(newState) {
        state = newState;
        return !!state;
      });
  }
  this.doNext = doNext;

  Object.defineProperties(this, {
    id: {
      enumerable: true,
      get: function() {
        return uuid;
      }
    },

    players: {
      enumerable: true,
      get: function() {
        return gameData.players;
      }
    }
  });

  initialize();
}

module.exports = Game;