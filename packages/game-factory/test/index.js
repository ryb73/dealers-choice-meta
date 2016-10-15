"use strict";
/* jshint mocha: true */

const chai           = require("chai"),
      chaiAsPromised = require("chai-as-promised"),
      _              = require("lodash"),
      mockDeckConfig = require("dc-test").mockDeckConfig,
      dcEngine       = require("dc-engine"),
      Player         = dcEngine.Player,
      GameFactory    = require(".."),
      Game           = require("../lib/game");

chai.use(chaiAsPromised);
const assert = chai.assert;

describe("GameFactory", function() {
  let factory;

  beforeEach(function() {
    factory = new GameFactory(mockDeckConfig(0, 0, 0));
  });

  afterEach(function() {
    factory = null;
  });

  describe("addPlayer", function() {
    it("adds a player", function() {
      let player = factory.addPlayer();
      assert.ok(player);
      assert.equal(player, factory.players[0]);
    });

    it("doesn't go above the max number of players", function() {
      _.times(6, factory.addPlayer);
      assert.notOk(factory.addPlayer());
      assert.equal(factory.players.length, 6);
    });
  });

  describe("removePlayer", function() {
    it("removes the specified player", function() {
      let player = factory.addPlayer();
      assert.ok(factory.removePlayer(player));
      assert.equal(factory.players.length, 0);
    });

    it("doesn't remove a player that's not there", function() {
      factory.addPlayer();
      assert.notOk(factory.removePlayer(new Player(0)));
      assert.equal(factory.players.length, 1);
    });
  });

  describe("createGame", function() {
    it("doesn't start the game if it's not ready", function() {
      factory.addPlayer();
      assert.throws(factory.createGame.bind(null, {}));
    });

    it("creates a game instance if it is ready", function() {
      _.times(2, factory.addPlayer);
      assert.instanceOf(factory.createGame({}), Game);
    });
  });
});