"use strict";

const chai                    = require("chai"),
      q                       = require("q"),
      dcEngine                = require("dc-engine"),
      Player                  = dcEngine.Player,
      Car                     = dcEngine.Car,
      BlueBook                = dcEngine.BlueBook,
      cardPack                = require(".."),
      SellForBlueBookPlusN    = cardPack.SellForBlueBookPlusN;

const assert = chai.assert;

describe("SellForBlueBookPlusN", function() {
  describe("play", function() {
    let price, plus, gameData, car, me;

    beforeEach(function() {
      price = 100;
      plus = 50;

      gameData = {};
      car = new Car(1, 999);

      let carPrices = {};
      carPrices[car.id] = price;
      let blueBook = new BlueBook(carPrices);

      me = new Player(0);
      me.blueBook = blueBook;
      me.buyCar(car, 0);
    });

    it("takes car from player, gives $$$", function(done) {
      let choiceProvider = {
        chooseOwnCar: function(pGameData, pPlayer) {
          assert.equal(pGameData, gameData);
          assert.equal(pPlayer, me);
          return q(car);
        }
      };

      new SellForBlueBookPlusN(plus)
        .play(gameData, choiceProvider, me)
        .then(function() {
          assert.notOk(me.hasCar(car));
          assert.equal(me.money, price + plus);
          done();
        })
        .catch(done);
    });

    it("doesn't take care or pay out if I cancel", function(done) {
      let choiceProvider = {
        chooseOwnCar: function(pGameData, pPlayer) {
          assert.equal(pGameData, gameData);
          assert.equal(pPlayer, me);
          return q();
        }
      };

      new SellForBlueBookPlusN(plus)
        .play(gameData, choiceProvider, me)
        .then(function() {
          assert.ok(me.hasCar(car));
          assert.equal(me.money, 0);
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
      assert.ok(new SellForBlueBookPlusN(0).canPlay(me, {}));
    });

    it("can't be played if the player don't have a car", function() {
      let me = new Player(0);
      assert.notOk(new SellForBlueBookPlusN(0).canPlay(me, {}));
    });
  });
});
