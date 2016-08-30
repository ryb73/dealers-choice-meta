"use strict";

var consts         = require("../constants"),
    PlayerHand     = require("../player-hand"),
    InsuranceFront = require("../cards/insurance-front");

var CARD_SPACING = 10;

function MyInsurances(insurances) {
  this.PlayerHand_constructor(insurances, true);

  this.setBounds(0, 0, consts.cardLength, 0);
}

var p = createjs.extend(MyInsurances, PlayerHand);

// Overrides superclass
p._addCards = function(insurances) {
  var cardDisp;

  for(var i = 0; i < insurances.length; ++i) {
    cardDisp = new InsuranceFront(insurances[i]);

    this._addToOpenSlot(cardDisp);
  }

  this._rearrangeCards();
};

p._getCoordsForCard = function(index) {
  return {
    x: consts.cardLengthSm / 2, // account for regX
    // place cards in negative coords (moving up)
    y: -(index * (consts.cardBreadthSm + CARD_SPACING) + consts.cardBreadthSm / 2)
  };
};

module.exports = createjs.promote(MyInsurances, "PlayerHand");