"use strict";

var BOX_WIDTH         = 600,
    BOX_HEIGHT_ME     = 150,
    BOX_HEIGHT_OTHERS = 300;

var q             = require("q"),
    PlayerDcCards = require("./player-dc-cards"),
    PlayerCars    = require("./player-cars"),
    AvatarDisplay = require("./avatar-display");

function PlayerBox(user, isMe, debugMode, callbacks) {
  this.Container_constructor();

  this._setup(user, isMe, debugMode, callbacks);
}

var p = createjs.extend(PlayerBox, createjs.Container);
createjs.EventDispatcher.initialize(p);

p._setup = function(user, isMe, debugMode, callbacks) {
  this._callbacks = callbacks;
  this._player = user.player; // TODO: refactor this to be safer

  var height = (isMe) ? BOX_HEIGHT_ME : BOX_HEIGHT_OTHERS;
  this.setBounds(0, 0, BOX_WIDTH, height);
  this.regX = BOX_WIDTH / 2;
  this.regY = height / 2;

  if(debugMode)
    this._createBackground();

  this._createCars(user.player.cars);
  this._createDcCards(user.player.dcCards, isMe);
  if(!isMe)
    this._createAvatar(user);
};

p._createBackground = function() {
  var bg = new createjs.Shape();
  bg.graphics
    .beginFill("#D5EBD5")
    .drawRect(0, 0, this.getBounds().width, this.getBounds().height);

  this.addChild(bg);

  this._bg = bg;
};

p._createCars = function(cars) {
  // Reg point is 0,0
  var playerCars = new PlayerCars(cars);
  var carCoords = getCoordsForCars();
  playerCars.x = carCoords.x;
  playerCars.y = carCoords.y;
  this.addChild(playerCars);

  playerCars.on("card-mouseover", this._carMouseOver.bind(this));
  playerCars.on("card-mouseout", this._carMouseOut.bind(this));
  playerCars.on("card-click", this._carClick.bind(this));

  this._playerCars = playerCars;
};

p._carMouseOver = function(e) {
  this.dispatchEvent({
    type: "car-mouseover",
    carIndex: e.cardIndex
  });
};

p._carMouseOut = function(e) {
  this.dispatchEvent({
    type: "car-mouseout",
    carIndex: e.cardIndex
  });
};

p._carClick = function(e) {
  if(!this.defCarId)
    return;

  var card = this._player.cars[e.cardIndex];
  this.defCarId.resolve(card.id);
  this.defCarId = null;
};

p._createDcCards = function(dcCards, isMe) {
  // Reg point is 0,0
  var playerDcCards = new PlayerDcCards(BOX_WIDTH, dcCards, isMe);
  playerDcCards.y = 60;
  this.addChild(playerDcCards);

  playerDcCards.on("card-mouseover", this._dcCardMouseOver.bind(this));
  playerDcCards.on("card-mouseout", this._dcCardMouseOut.bind(this));
  playerDcCards.on("card-click", this._dcCardClick.bind(this));

  this._playerDcCards = playerDcCards;
};

p._dcCardMouseOver = function(e) {
  this.dispatchEvent({
    type: "dc-card-mouseover",
    cardIndex: e.cardIndex
  });
};

p._dcCardMouseOut = function(e) {
  this.dispatchEvent({
    type: "dc-card-mouseout",
    cardIndex: e.cardIndex
  });
};

p._dcCardClick = function(e) {
  if(!this.defPlayedCardId)
    return;

  var card = this._player.dcCards[e.cardIndex];
  this._callbacks.canPlayDcCard(card.id)
    .done(function(canPlay) {
      if(!canPlay) return;

      this.defPlayedCardId.resolve(card.id);
      this.defPlayedCardId = null;
    }.bind(this));
};

p._createAvatar = function(user) {
  // Reg point is center of picture
  var avatarDisplay = new AvatarDisplay(user);
  avatarDisplay.x = BOX_WIDTH / 2;
  avatarDisplay.y = this._playerDcCards.y +
                    this._playerDcCards.getBounds().height + 40 +
                    avatarDisplay.regY;
  this.addChild(avatarDisplay);

  this._avatarDisplay = avatarDisplay;
};

p.setRotation = function(rotationDeg) {
  if(this._avatarDisplay)
    this._avatarDisplay.rotation = -rotationDeg;

  this._playerCars.setRotation(rotationDeg);
};

p.makeSpaceForCar = function(transitionTime) {
  let coords = this._playerCars.makeSpaceForCard(transitionTime);
  this._moveCarsCoords(transitionTime);

  // We'll get the coords in relation to the playerCars
  // Return them in relation to the playerBox
  let carDispCoords = getCoordsForCars();
  coords.x += carDispCoords.x;
  coords.y += carDispCoords.y;
  return coords;
};

// Stupid. Basically playerCars resizes itself and we need to account for that
p._moveCarsCoords = function(transitionTime) {
  let carDispCoords = getCoordsForCars();
  createjs.Tween.get(this._playerCars)
    .to(carDispCoords, transitionTime);
};

function getCoordsForCars() {
  return {
    x: BOX_WIDTH / 2,
    y: 50
  };
}

p.putCarInBlankSpace = function(qNewCar) {
  return this._playerCars.putCardInBlankSpace(qNewCar);
};

p.makeSpaceForDcCard = function(transitionTime) {
  var coords = this._playerDcCards.makeSpaceForCard(transitionTime);
  coords.y += this._playerDcCards.y;
  return coords;
};

p.putDcCardInBlankSpace = function(qNewCard) {
  return this._playerDcCards.putCardInBlankSpace(qNewCard)
    .tap(this.highlightNewCard.bind(this));
};

p.highlightNewCard = function(cardIndex) {
  // If a new card is added and we're highlighting playable cards, highlight the new one if applicable
  if(!this.defPlayedCardId)
    return;

  var card = this._player.dcCards[cardIndex];
  this._callbacks.canPlayDcCard(card.id)
    .done(this._highlightDcCardIfCanPlay.bind(this, cardIndex));
};

p._getCoordsForInsurance = function() {
  var res = this._playerCars.getFirstCarCoords();
  if(res) {
    res.x += this._playerCars.x;
    res.y += this._playerCars.y;
    return res;
  }

  return { x: 0, y: 0 };
};

p.giveInsurance = function(insuranceDisp, initialCoords, transitionTime) {
  this.addChildAt(insuranceDisp, 0);
  insuranceDisp.x = initialCoords.x;
  insuranceDisp.y = initialCoords.y;
  insuranceDisp.rotation = initialCoords.rotation;

  var destCoords = this._getCoordsForInsurance();

  var deferred = q.defer();
  createjs.Tween.get(insuranceDisp)
    .to(destCoords, transitionTime, createjs.Ease.cubicOut)
    .call(function() {
      this.removeChild(insuranceDisp);
      deferred.resolve();
    }.bind(this));

  return deferred.promise;
};

p.removeCar = function(carIdx, transitionTime) {
  let carDisp = this._playerCars.removeCard(carIdx, transitionTime);
  this._moveCarsCoords(transitionTime);

  let coords = this._playerCars.localToLocal(carDisp.x, carDisp.y, this);

  return {
    carDisp: carDisp,
    coords: {
      x: coords.x,
      y: coords.y
    }
  };
};

p.removeDcCard = function(carIdx, transitionTime) {
  let cardDisp = this._playerDcCards.removeCard(carIdx, transitionTime);

  let coords = this._playerDcCards.localToLocal(cardDisp.x, cardDisp.y, this);

  return {
    cardDisp: cardDisp,
    coords: {
      x: coords.x,
      y: coords.y
    }
  };
};

p.removeRandomDcCard = function(transitionTime) {
  let cardIdx = Math.floor(Math.random() * this._player.dcCards.length);
  return this.removeDcCard(cardIdx, transitionTime);
};

p.askForDcCardToPlay = function() {
  this._highlightPlayableCards();
  this.defPlayedCardId = q.defer();
  return this.defPlayedCardId.promise
    .tap(this.stopAskingForDcCard.bind(this));
};

p.stopAskingForDcCard = function() {
  this._unhighlightPlayableCards();

  if(this.defPlayedCardId)
    this.defPlayedCardId.reject();
  this.defPlayedCardId = null;
};

p.askForCar = function() {
  this._highlightCars();
  this.defCarId = q.defer();
  return this.defCarId.promise
    .tap(this.stopAskingForCar.bind(this));
};

p.stopAskingForCar = function() {
  this._unhighlightCars();

  if(this.defCarId)
    this.defCarId.reject();
  this.defCarId = null;
};

p._highlightDcCardIfCanPlay = function(idx, canPlay) {
  if(canPlay)
    this._playerDcCards.highlightCard(idx);
};

p._highlightPlayableCards = function() {
  for(var i = 0; i < this._player.dcCards.length; ++i) {
    this._callbacks.canPlayDcCard(this._player.dcCards[i].id)
      .done(this._highlightDcCardIfCanPlay.bind(this, i));
  }
};

p._unhighlightPlayableCards = function() {
  for(var i = 0; i < this._player.dcCards.length; ++i) {
    this._playerDcCards.unhighlightCard(i);
  }
};

p._highlightCars = function() {
  for(var i = 0; i < this._player.cars.length; ++i) {
    this._playerCars.highlightCard(i);
  }
};

p._unhighlightCars = function() {
  for(var i = 0; i < this._player.cars.length; ++i) {
    this._playerCars.unhighlightCard(i);
  }
};

module.exports = createjs.promote(PlayerBox, "Container");
