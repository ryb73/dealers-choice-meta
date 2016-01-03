/* global createjs */
/* jshint globalstrict: true */
"use strict";

var q                = require("q"),
    _                = require("lodash"),
    consts           = require("./constants"),
    CarFront         = require("./cards/car-front"),
    CardDisplay      = require("./cards/card-display"),
    FlippableCard    = require("./cards/flippable-card"),
    DcCardFront      = require("./cards/dc-card-front"),
    InsuranceDisplay = require("./cards/insurance-display"),
    assets           = require("./assets");

var DECK_SPACING = 5,
    DC_CARD_Y    = consts.cardBreadth / 2 + consts.cardBreadth +
                    DECK_SPACING;

function Decks() {
  this.Container_constructor();

  this._setup();
}

var p = createjs.extend(Decks, createjs.Container);

p._setup = function() {
  var totalHeight = consts.cardBreadth * 3 + DECK_SPACING * 2;
  this.setBounds(0, 0, consts.cardLength, totalHeight);
  this.regX = 0;
  this.regY = totalHeight / 2; // I think this is sort of an anti-pattern but am not terribly concerned right now

  var carDeck = createCardBack(assets.carBack);
  carDeck.x = carDeck.regX;
  carDeck.y = consts.cardBreadth / 2;
  this.addChild(carDeck);

  var dcDeck = createCardBack(assets.dcCardBack);
  dcDeck.rotation = -90;
  dcDeck.x = dcDeck.regY; // regyY because it's rotated
  dcDeck.y = DC_CARD_Y;
  this.addChild(dcDeck);

  var insuranceDeck = createCardBack(assets.insuranceBack);
  insuranceDeck.rotation = -90;
  insuranceDeck.x = insuranceDeck.regY;
  insuranceDeck.y = consts.cardBreadth / 2 +
                    2 * (consts.cardBreadth + DECK_SPACING);
  this.addChild(insuranceDeck);
};

p.giveCar = function(car, destCoords, transitionTime) {
  var newCard = createCarFront(car);
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

p.giveDcCard = function(dcCard, destCoords, transitionTime, flip) {
  var newCard = createDcCardFront(dcCard);
  if(flip) newCard.flip(transitionTime / 4);
  newCard.y = DC_CARD_Y;
  this.addChild(newCard);

  var deferred = q.defer();
  createjs.Tween.get(newCard)
    .to(destCoords, transitionTime, createjs.Ease.cubicOut)
    .call(function() {
      deferred.resolve(newCard);
    });

  return deferred.promise;
};

function createCardBack(image) {
  var back = new CardDisplay(
    new createjs.Bitmap(image)
  );

  return back;
}

// car: Optional reference to car. If omitted, creates
//      a blank car
function createCarFront(car) {
  var back = createCardBack(assets.carBack);
  var front = new CarFront(car);
  var flippable = new FlippableCard(back, front);
  flippable.x = flippable.regX;
  flippable.y = flippable.regY;
  return flippable;
}

function createDcCardFront(dcCard) {
  var back = createCardBack(assets.dcCardBack);
  var front = new DcCardFront(dcCard);
  var flippable = new FlippableCard(back, front);

  flippable.rotation = -90;
  flippable.x = flippable.regY; // regY because it's rotated
  flippable.y = flippable.regX;

  return flippable;
}

// function createInsuranceCard() {
//   var insuranceDisplay = new InsuranceDisplay();
//   insuranceDisplay.rotation = -90;

//   // regY because it's rotated
//   insuranceDisplay.x = insuranceDisplay.regY;

//   return insuranceDisplay;
// }

module.exports = createjs.promote(Decks, "Container");