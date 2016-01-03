"use strict";

var CardDisplay = require("./card-display"),
    assets      = require("../assets");

function CarFront(car, fullSize) {
  var frontImgId;
  frontImgId = (fullSize) ? car.image : car.imageSm;

  this.CardDisplay_constructor(
    new createjs.Bitmap(assets[frontImgId])
  );
}

createjs.extend(CarFront, CardDisplay);

module.exports = createjs.promote(CarFront, "CardDisplay");