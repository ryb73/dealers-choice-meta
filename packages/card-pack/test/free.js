"use strict";

const chai                    = require("chai"),
      dcEngine                = require("dc-engine"),
      Player                  = dcEngine.Player,
      Insurance               = dcEngine.Insurance,
      cardPack                = require(".."),
      Free                    = cardPack.Free;

const assert = chai.assert;

describe("Free", function() {
  describe("canPlay", function() {
    it("can't be played if there are no insurances", function() {
      let gameData = {
        insuranceDeck: { remaining: 0 }
      };

      assert.notOk(new Free().canPlay({}, gameData));
    });

    it("can be played if there are insurances", function() {
      let gameData = {
        insuranceDeck: { remaining: 1 }
      };

      assert.ok(new Free().canPlay({}, gameData));
    });
  });

  describe("play", function() {
    it("gives the player an insurance", function(done) {
      let me = new Player(0);
      let insurance = new Insurance();
      let gameData = {
        insuranceDeck: {
          pop: function() { return insurance; }
        }
      };

      new Free().play(gameData, null, me)
        .then(function() {
          assert.ok(me.hasInsurance(insurance));
          done();
        })
        .catch(done);
    });
  });
});