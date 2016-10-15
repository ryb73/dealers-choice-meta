"use strict";

const q            = require("q"),
      giveUniqueId = require("give-unique-id");

function MockCard() {
  giveUniqueId(this);

  function play(gameData, choiceProvider, player) {
    return q();
  }
  this.play = play;
}

module.exports = MockCard;