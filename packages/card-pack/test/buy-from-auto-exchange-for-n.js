"use strict";

const chai                    = require("chai"),
      dcEngine                = require("dc-engine"),
      Player                  = dcEngine.Player,
      Car                     = dcEngine.Car,
      cardPack                = require(".."),
      BuyFromAutoExchangeForN = cardPack.BuyFromAutoExchangeForN;

const assert = chai.assert;

describe("BuyFromAutoExchangeForN", function() {
  describe("canPlay", function() {
    it("can't be played without enough money", function() {
      let cost = 100;
      let me = new Player(cost - 1);
      let gameData = {
        carDeck: { remaining: 1 }
      };

      let card = new BuyFromAutoExchangeForN(cost);
      assert.notOk(card.canPlay(me, gameData));
    });

    it("can't be played if there are no cars", function() {
      let me = new Player(1000000);
      let gameData = {
        carDeck: { remaining: 0 }
      };

      let card = new BuyFromAutoExchangeForN(1);
      assert.notOk(card.canPlay(me, gameData));
    });

    it("can be played with enough money and a car", function() {
      let cost = 100;
      let me = new Player(cost);
      let gameData = {
        carDeck: { remaining: 1 }
      };

      let card = new BuyFromAutoExchangeForN(cost);
      assert.ok(card.canPlay(me, gameData));
    });
  });

  describe("play", function() {
    it("gives the player the top car and debit accordingly", function(done) {
      let cost = 100;
      let me = new Player(cost);
      let car = new Car(1, 1);
      let gameData = {
        carDeck: {
          pop: function() { return car; }
        }
      };

      let card = new BuyFromAutoExchangeForN(cost);
      card.play(gameData, null, me)
        .then(function() {
          assert.ok(me.hasCar(car));
          assert.equal(me.money, 0);
          done();
        })
        .catch(done);
    });
  });
});