// Abstract class representing a displayable container of cards
"use strict";

const q = require("q");

function PlayerHand(cardsData, noRandomize) {
  this.Container_constructor();

  this._cardSlots = [];
  this._openSlotIdx = 0;
  this._randomize = !noRandomize;

  this._addCards(cardsData);
}

var p = createjs.extend(PlayerHand, createjs.Container);
createjs.EventDispatcher.initialize(p);

p._addToOpenSlot = function(dispCard) {
  if(!this._hasOpenSlot())
    this._cardSlots.push(null);

  dispCard.on("rollover", this._cardMouseOver.bind(this, this._openSlotIdx));
  dispCard.on("rollout", this._cardMouseOut.bind(this, this._openSlotIdx));
  dispCard.on("click", this._cardClick.bind(this, this._openSlotIdx));

  this._cardSlots[this._openSlotIdx++] = dispCard;
  this.addChild(dispCard);
};

p._cardMouseOver = function(idx) {
  this.dispatchEvent({
    type: "card-mouseover",
    cardIndex: idx
  });
};

p._cardMouseOut = function(idx) {
  this.dispatchEvent({
    type: "card-mouseout",
    cardIndex: idx
  });
};

p._cardClick = function(idx) {
  this.dispatchEvent({
    type: "card-click",
    cardIndex: idx
  });
};

p._hasOpenSlot = function() {
  return this._openSlotIdx !== this._cardSlots.length;
};

p._rearrangeCards = function(transitionTime) {
  transitionTime = transitionTime || 0;

  // debugger;

  for(var i = 0; i < this._cardSlots.length; ++i) {
    let dispCard = this._cardSlots[i];
    if(!dispCard) continue;

    let coords = this._getCoordsForCard(i);
    this._randomizeCoords(coords);

    createjs.Tween.get(dispCard, { override: true })
      .to(coords, transitionTime, createjs.Ease.cubicOut);
  }
};

// Randomize coords a bit for a slightly more realistic look
p._randomizeCoords = function(coords) {
  if(this._randomize) {
    coords.x += (Math.random() * 9) - 4;
    coords.y += (Math.random() * 9) - 4;
    coords.rotation += (Math.random() * 5) - 2;
  }
};

p.makeSpaceForCard = function(transitionTime) {
  this._cardSlots.push(null);
  this._rearrangeCards(transitionTime);
  return this._getCoordsForCard(this._cardSlots.length - 1);
};

p.putCardInBlankSpace = function(qNewCard, transitionTime) {
  if(qNewCard.then)
    return qNewCard.then(this._putCardInBlankSpace.bind(this, transitionTime));

  return this._putCardInBlankSpace(transitionTime, qNewCard);
};

p._putCardInBlankSpace = function(transitionTime, newCard) {
  if(this._openSlotIdx === this._cardSlots.length)
    throw new Error("No open slots in car display");

  var openSlot = this._openSlotIdx;

  if(newCard.parent)
    newCard.parent.removeChild(newCard);

  let deferred = q.defer();

  let coords = this._getCoordsForCard(this._openSlotIdx);

  if(transitionTime) {
    createjs.Tween.get(newCard)
      .to(coords, transitionTime, createjs.Ease.cubicOut)
      .call(() => deferred.resolve());
  } else {
    newCard.x = coords.x;
    newCard.y = coords.y;
    newCard.rotation = coords.rotation;
    deferred.resolve();
  }

  this._addToOpenSlot(newCard);
  return deferred.promise.thenResolve(openSlot);
};

p.removeCard = function(cardIdx, transitionTime) {
  var oldCardDisp = this._cardSlots.splice(cardIdx, 1)[0];
  --this._openSlotIdx;
  this._rearrangeCards(transitionTime);
  return oldCardDisp;
};

p.highlightCard = function(cardIndex) {
  let cardDisp = this._cardSlots[cardIndex];
  cardDisp.highlight();
  cardDisp.cursor = "pointer";
};

p.unhighlightCard = function(cardIndex) {
  this._cardSlots[cardIndex].unhighlight();
  this._cardSlots[cardIndex].cursor = "default";
};

p.isCardHighlighted = function(cardIndex) {
  let cardDisp = this._cardSlots[cardIndex];
  return cardDisp.isHighlighted();
};

p._addCards = unimplemented;

function unimplemented() {
  throw new Error("Method not implemented");
}

module.exports = createjs.promote(PlayerHand, "Container");
