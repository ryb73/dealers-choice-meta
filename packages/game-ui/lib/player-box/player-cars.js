/* global createjs */
/* jshint strict: global */
"use strict";

var consts     = require("../constants"),
    CarFront   = require("../cards/car-front"),
    PlayerHand = require("../player-hand");

var VERT_SPACING  = 10,
    HORIZ_SPACING = 10;

function PlayerCars(cars) {
  this.PlayerHand_constructor(cars);

  this._resetBounds();
}

var p = createjs.extend(PlayerCars, PlayerHand);

function getTotalColumns(numCars) {
  return Math.ceil(Math.sqrt(numCars));
}

function getTotalRows(numCars) {
  return Math.ceil(numCars / getTotalColumns(numCars));
}

function getRowForCar(whichCarIndex, numCars) {
  return Math.floor(whichCarIndex / getTotalColumns(numCars));
}

function getColumnForCar(whichCarIndex, numCars) {
  return whichCarIndex % getTotalColumns(numCars);
}

function getRowWidth(numColumns) {
  return consts.cardLengthSm * numColumns +
         HORIZ_SPACING * (numColumns - 1);
}

function getTotalHeight(numRows) {
  return numRows * consts.cardBreadthSm +
         (numRows - 1) * VERT_SPACING;
}

p._getCoordsForCard = function(whichCarIndex) {
  let numCars = this._cardSlots.length;

  let column = getColumnForCar(whichCarIndex, numCars);
  let row = getRowForCar(whichCarIndex, numCars);

  let totalRows = getTotalRows(numCars);
  let originY = -((consts.cardBreadthSm + VERT_SPACING) * totalRows - VERT_SPACING);

  let y = originY + (consts.cardBreadthSm + VERT_SPACING) * row +
           consts.cardBreadthSm / 2; // reg point is in middle

  let totalColumns = getTotalColumns(numCars);
  let rowColumns;
  if(row === totalRows - 1) { // if last row
    rowColumns = numCars % totalColumns;  // it might be shorter
    if(rowColumns === 0) rowColumns = totalColumns;
  } else {
    rowColumns = totalColumns;
  }

  // Find the width of this particular row. If it's the
  // "short row", we'll start placing cars at an offset
  let rowWidth = getRowWidth(rowColumns);
  let originX = -rowWidth / 2;

  let x = originX + (consts.cardLengthSm + HORIZ_SPACING) * column +
           consts.cardLengthSm / 2;

  // Rotate so that the user can see the car. While this isn't
  // really how players would lay out their cars in the real
  // world, it makes it easier for the current player
  let rotation = 0;
  if(this._rotation >= 90 && this._rotation <= 270)
    rotation = 180;

  return {
    x: x,
    y: y,
    rotation: rotation
  };
};

p._resetBounds = function() {
  var columns = getTotalColumns(this._cardSlots.length);
  var rows = getTotalRows(this._cardSlots.length);

  let newWidth = getRowWidth(columns);
  let newHeight = getTotalHeight(rows);

  let bounds = this.getBounds();
  if(bounds.width !== newWidth || bounds.height !== newHeight){
    this.setBounds(0, 0, newWidth, newHeight);
  }
};

// Overrides superclass
p._addCards = function(cars) {
  for(var i = 0; i < cars.length; ++i) {
    var dispCar = this._addCar(cars[i]);
    this._addToOpenSlot(dispCar);
  }

  this._rearrangeCards();
};

p._addCar = function(car) {
  var dispCar = new CarFront(car);
  return dispCar;
};

// Overrides superclass
p.makeSpaceForCard = function(transitionTime) {
  let result = this.PlayerHand_makeSpaceForCard(transitionTime);
  this._resetBounds();
  return result;
};

// Overrides superclass
p.removeCard = function(cardIdx, transitionTime) {
  let result = this.PlayerHand_removeCard(cardIdx, transitionTime);
  this._resetBounds();
  return result;
};

p.getFirstCarCoords = function() {
  if(this._cardSlots.length === 0 ||
      !this._cardSlots[0]) return null;

  return {
    x: this._cardSlots[0].x,
    y: this._cardSlots[0].y,
    rotation: this._cardSlots[0].rotation
  };
};

p.setRotation = function(rotation) {
  if(this._rotation === rotation) return;
  this._rotation = rotation;
  this._rearrangeCards();
};

module.exports = createjs.promote(PlayerCars, "PlayerHand");