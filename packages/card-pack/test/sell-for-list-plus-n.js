"use strict";

const chai                    = require("chai"),
      q                       = require("q"),
      dcEngine                = require("dc-engine"),
      Player                  = dcEngine.Player,
      Car                     = dcEngine.Car,
      cardPack                = require(".."),
      SellForListPlusN        = cardPack.SellForListPlusN;

const assert = chai.assert;

describe("SellForListPlusN", function() {
  describe("play", function() {
    let price, plus, me, gameData, car;

    beforeEach(function() {
      price = 100;
      plus = 50;
      me = new Player(0);
      gameData = {};

      car = new Car(1, price);
      me.buyCar(car, 0);
    });

    it("takes car from player, gives $$$", function(done) {
      let choiceProvider = {
        chooseOwnCar: function(pPlayer) {
          assert.equal(pPlayer, me);
          return q(car);
        }
      };

      new SellForListPlusN(plus)
        .play(gameData, choiceProvider, me)
        .then(function() {
          assert.notOk(me.hasCar(car));
          assert.equal(me.money, price + plus);
          done();
        })
        .catch(done);
    });
  });

  describe("canPlay", function() {
    it("can be played if the player has a car", function() {
      let me = new Player(0);
      let car = new Car(1, 1);
      me.buyCar(car, 0);
      assert.ok(new SellForListPlusN(0).canPlay(me, {}));
    });

    it("can't be played if the player don't have a car", function() {
      let me = new Player(0);
      assert.notOk(new SellForListPlusN(0).canPlay(me, {}));
    });
  });
});