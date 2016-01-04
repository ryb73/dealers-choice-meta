"use strict";

var consts      = require("../constants"),
    DcCardFront = require("../cards/dc-card-front"),
    PlayerHand  = require("./player-hand");

function PlayerDcCards(availWidth, cards, isMe) {
  this._availWidth = availWidth;
  this._isMe = isMe;

  this.PlayerHand_constructor(cards);

  this.setBounds(0, 0, availWidth, consts.cardLengthSm);
}

var p = createjs.extend(PlayerDcCards, PlayerHand);

// Overrides superclass
p._addCards = function(cards) {
  for(var i = 0; i < cards.length; ++i)
    this._addToOpenSlot(new DcCardFront());

  this._rearrangeCards();
};

p._getCoordsForCard = function(idx) {
  var cardSpacingFactor = this._getCardSpacingFactor();
  var originX = this._getOriginX(cardSpacingFactor);
  return {
    x: originX + idx * cardSpacingFactor *
        consts.cardBreadthSm,
    y: consts.cardLengthSm / 2,
    rotation: 0
  };
};

// Calculates the horizontal space that the cards will take up
// This allows us to determine where we should place the first
// card.
p._getOriginX = function(cardSpacingFactor) {
  var cardsHSpace = cardSpacingFactor * consts.cardBreadthSm *
                     (this._cardSlots.length - 1) +
                     consts.cardBreadthSm;
  return (this._availWidth - cardsHSpace) / 2 +
          consts.cardBreadthSm / 2; // account for card regX
};

p._getCardSpacingFactor = function() {
  var idealCSF = (this._isMe) ? 1.25 : 0.75;
  var availCSF = this._availWidth /
                  (consts.cardBreadthSm * this._cardSlots.length);

  return Math.min(idealCSF, availCSF);
};

module.exports = createjs.promote(PlayerDcCards, "PlayerHand");