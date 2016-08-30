"use strict";

var q              = require("q"),
    consts         = require("./constants"),
    CarFront       = require("./cards/car-front"),
    CardDisplay    = require("./cards/card-display"),
    FlippableCard  = require("./cards/flippable-card"),
    DcCardFront    = require("./cards/dc-card-front"),
    InsuranceFront = require("./cards/insurance-front"),
    assets         = require("./assets");

var DECK_SPACING     = 5,
    DC_CARD_Y        = consts.cardBreadthSm / 2 + consts.cardBreadthSm +
                        DECK_SPACING,
    INSURANCE_CARD_Y = consts.cardBreadthSm / 2 +
                        2 * (consts.cardBreadthSm + DECK_SPACING);

function Decks() {
  this.Container_constructor();

  this._setup();
}

var p = createjs.extend(Decks, createjs.Container);

p._setup = function() {
  var totalHeight = consts.cardBreadthSm * 3 + DECK_SPACING * 2;
  this.setBounds(0, 0, consts.cardLengthSm, totalHeight);
  this.regX = 0;
  this.regY = totalHeight / 2; // I think this is sort of an anti-pattern but am not terribly concerned right now

  var carDeck = createCardBack(assets.carBack);
  carDeck.x = carDeck.regX;
  carDeck.y = carDeck.regY;
  this.addChild(carDeck);

  var dcDeck = createCardBack(assets.dcCardBack);
  dcDeck.rotation = -90;
  dcDeck.x = dcDeck.regY; // regyY because it's rotated
  dcDeck.y = DC_CARD_Y;
  this.addChild(dcDeck);

  var insuranceDeck = createCardBack(assets.insuranceBack);
  insuranceDeck.x = insuranceDeck.regX;
  insuranceDeck.y = INSURANCE_CARD_Y;
  this.addChild(insuranceDeck);
};

p.giveCar = function(car, destCoords, transitionTime) {
  var newCard = createCar(car);
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
  var newCard = createDcCard(dcCard);
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

p.giveInsurance = function(insurance, destCoords, transitionTime) {
  var newCard = createInsurance(insurance);
  newCard.flip(transitionTime / 4);
  newCard.y = INSURANCE_CARD_Y;
  this.addChild(newCard);

  var deferred = q.defer();
  createjs.Tween.get(newCard)
    .to(destCoords, transitionTime, createjs.Ease.cubicOut)
    .call(function() {
      deferred.resolve(newCard);
    });

  return deferred.promise;
};

p.getInsuranceToGive = function() {
  var card = new createCardBack(assets.insuranceBack);
  return {
    insuranceDisp: card,
    coords: {
      x: card.x,
      y: INSURANCE_CARD_Y,
      rotation: card.rotation
    },
  };
};

p.discardCar = function(carDisp, startingCoords, transitionTime) {
  carDisp.parent.removeChild(carDisp);
  // carDisp.set(startingCoords);
  carDisp.x = startingCoords.x;
  carDisp.y = startingCoords.y;
  carDisp.rotation = startingCoords.rotation;
  this.addChildAt(carDisp, 0);

  var destCoords = {
    x: carDisp.regX,
    y: carDisp.regY,
    rotation: 0
  };

  var deferred = q.defer();
  createjs.Tween.get(carDisp)
    .to(destCoords, transitionTime, createjs.Ease.cubicOut)
    .call(function() {
      this.removeChild(carDisp);
      deferred.resolve();
    }.bind(this));

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
function createCar(car) {
  var back = createCardBack(assets.carBack);
  var front = new CarFront(car);
  var flippable = new FlippableCard(back, front);
  flippable.x = flippable.regX;
  flippable.y = flippable.regY;
  return flippable;
}

function createDcCard(dcCard) {
  var back = createCardBack(assets.dcCardBack);
  var front = new DcCardFront(dcCard);
  var flippable = new FlippableCard(back, front);

  flippable.rotation = -90;
  flippable.x = flippable.regY; // regY because it's rotated

  return flippable;
}

function createInsurance(insurance) {
  var back = new createCardBack(assets.insuranceBack);
  var front = new InsuranceFront(insurance);
  var flippable = new FlippableCard(back, front);

  flippable.x = back.regX;

  return flippable;
}

module.exports = createjs.promote(Decks, "Container");