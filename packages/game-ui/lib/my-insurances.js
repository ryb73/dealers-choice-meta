"use strict";

var consts     = require("./constants"),
    PlayerHand = require("./player-hand");

var CARD_SPACING = 10;

function MyInsurances() {
  this.PlayerHand_constructor(null, true);

  this.setBounds(0, 0, consts.cardLength, 0);
}

var p = createjs.extend(MyInsurances, PlayerHand);

// Overrides superclass
p._addCards = function(cars) {
  // TODO: implement
};

p._getCoordsForCard = function(index) {
  return {
    x: consts.cardLengthSm / 2, // account for regX
    // place cards in negative coords (moving up)
    y: -(index * (consts.cardBreadthSm + CARD_SPACING) + consts.cardBreadthSm / 2)
  };
};

module.exports = createjs.promote(MyInsurances, "PlayerHand");