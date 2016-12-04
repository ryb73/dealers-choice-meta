"use strict";

const chai                    = require("chai"),
      q                       = require("q"),
      dcEngine                = require("dc-engine"),
      Player                  = dcEngine.Player,
      GameData                = dcEngine.GameData,
      Car                     = dcEngine.Car,
      cardPack                = require(".."),
      Attack                  = cardPack.Attack;

const assert = chai.assert;

describe("Attack", function() {
  describe("canPlay", function() {
    it("returns true when opponents have cars", function() {
      let me = { cars: [] }; // and I don't
      let gameData = {
        players: [
          me,
          { cars: [ "edsel" ] }
        ]
      };
      assert.ok(new Attack().canPlay(me, gameData));
    });

    it("returns false when opponents don't have cars", function() {
      let me = { cars: [ "lincoln" ] }; // but I do
      let gameData = {
        players: [
          me,
          { cars: [] }
        ]
      };
      assert.notOk(new Attack().canPlay(me, gameData));
    });
  });

  describe("play", function() {
    it("revokes the selected car if not blocked", function(done) {
      let victim = new Player(0);
      let me = new Player(0);

      let theCar = new Car(1, 1);
      victim.buyCar(theCar, 0);

      let gameData = new GameData([ victim, me ], emptyDecks());

      let choiceProvider = {
        chooseOpponentCar: function() { return q(theCar); },
        allowBlockAttack: function() { return q(false); }
      };

      new Attack().play(gameData, choiceProvider, me)
        .then(function() {
          assert.notOk(victim.hasCar(theCar));
          done();
        })
        .catch(done);
    });

    it("makes the attacker pay list price if blocked", function(done) {
      let carPrice = 100;
      let victim = new Player(0);
      let me = new Player(carPrice);

      let theCar = new Car(1, carPrice);
      victim.buyCar(theCar, 0);

      let gameData = new GameData([ victim, me ], emptyDecks());

      let choiceProvider = {
        chooseOpponentCar: function() { return q(theCar); },
        allowBlockAttack: function() { return q(true); }
      };

      new Attack().play(gameData, choiceProvider, me)
        .then(function() {
          assert.ok(victim.hasCar(theCar));
          assert.equal(victim.money, carPrice);
          assert.equal(me.money, 0);
          done();
        })
        .catch(done);
    });
  });
});

function emptyDecks() {
  return {
    dcDeck: [],
    insuranceDeck: [],
    carDeck: []
  };
}