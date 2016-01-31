"use strict";

const _      = require("lodash"),
      q      = require("q"),
      DcCard = require("dc-engine").DcCard;

function MockCard() {
  DcCard.call(this);
  let supr = _.clone(this);

  function play(gameData, choiceProvider, player) {
    supr.play(gameData, choiceProvider, player);
    return q();
  }
  this.play = play;
}

module.exports = MockCard;