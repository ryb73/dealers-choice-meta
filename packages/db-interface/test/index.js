"use strict";
/* jshint mocha: true */

const chai             = require("chai"),
      _                = require("lodash"),
      gameStates       = require("dc-game-states"),
      symbols          = require("dc-constants").Symbols,
      presetTransforms = require("../lib/preset-transforms");

const assert = chai.assert;

describe("presetTransforms", function() {
  describe("transformPresetFromDb", function() {
    it("transforms basic game", function() {
        let before = {
            id: 1,
            name: "Basic Game",
            state: {
                stateClass: "PlayerTurnBeginState",
                args: [ "PLAYER_1" ]
            },
            players: [{
                money: 17000,
                dcCards: [ "list3", null, null, null, null ],
                cars: [ 24 , null, null, null ],
                insurances: [ "fire" ]
            }, {
                money: 17000,
                dcCards: [ null, null, null, null, null ],
                cars: [ null, null, null, null ],
                insurances: [ null ]
            }]
        };

        let expected = {
            id: 1,
            name: "Basic Game",
            state: {
                stateClass: gameStates.PlayerTurnBeginState,
                args: [ symbols.player1 ]
            },
            players: [{
                money: 17000,
                dcCards: [ "list3", ..._.fill(new Array(4), symbols.random) ],
                cars: [ 24 , ..._.fill(new Array(3), symbols.random) ],
                insurances: [ "fire" ]
            }, {
                money: 17000,
                dcCards: _.fill(new Array(5), symbols.random),
                cars: _.fill(new Array(4), symbols.random),
                insurances: [ symbols.random ]
            }]
        };

        let actual = presetTransforms.transformPresetFromDb(before);

        assert.deepEqual(actual, expected);
    });
  });
});