/* global createjs */
/* jshint globalstrict: true */
"use strict";

var q          = require("q"),
    consts     = require("./constants"),
    CarDisplay = require("./cards/car-display");

var DECK_WIDTH   = 93,
    DECK_HEIGHT  = 60,
    DECK_SPACING = 5;

function Decks() {
  this.Container_constructor();

  this._setup();
}

var p = createjs.extend(Decks, createjs.Container);

p._setup = function() {
  var totalHeight = DECK_HEIGHT * 3 + DECK_SPACING * 2;
  this.setBounds(0, 0, DECK_WIDTH, totalHeight);
  this.regX = 0;
  this.regY = totalHeight / 2; // I think this is sort of an anti-pattern but am not terribly concerned right now

  var carDeck = createCarCard();
  carDeck.y = DECK_HEIGHT / 2;
  this.addChild(carDeck);

  var dcDeck = createDcCard();
  dcDeck.y = DECK_HEIGHT / 2 + DECK_HEIGHT + DECK_SPACING;
  this.addChild(dcDeck);

  var insuranceDeck = createInsuranceCard();
  insuranceDeck.y = DECK_HEIGHT / 2 +
                    2 * (DECK_HEIGHT + DECK_SPACING);
  this.addChild(insuranceDeck);
};

p.giveCar = function(car, destCoords, transitionTime) {
  var newCard = createCarCard(car);
  newCard.flip(transitionTime / 4);
  this.addChild(newCard);

  var deferred = q.defer();
  createjs.Tween.get(newCard)
    .to(destCoords, transitionTime, createjs.Ease.cubicOut)
    .call(function() {
      deferred.resolve(newCard);
    });

  return deferred.promise;
};

// car: Optional reference to car. If omitted, creates
//      a blank car
function createCarCard(car) {
  var carDisplay = new CarDisplay(car);
  var bounds = carDisplay.getBounds();
  carDisplay.regX = bounds.width / 2;
  carDisplay.regY = bounds.height / 2;
  carDisplay.x = carDisplay.regX;
  return carDisplay;
}

function createDcCard() {
  return createGenericCard("#AA0099");
}

function createInsuranceCard() {
  return createGenericCard("#22FF77");
}

function createGenericCard(color) {
  var shape = new createjs.Shape();
  shape.graphics
    .beginStroke("#000")
    .beginFill(color)
    .drawRect(0, 0, DECK_WIDTH, DECK_HEIGHT);
  shape.regX = DECK_WIDTH / 2;
  shape.regY = DECK_HEIGHT / 2;
  shape.x = shape.regX;
  return shape;
}

module.exports = createjs.promote(Decks, "Container");