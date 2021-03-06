"use strict";

module.exports = AllowSecondDcCard;

const q            = require("q"),
      AllowOpenLot = require("./allow-open-lot");

function AllowSecondDcCard($gameData, $choiceProvider, $player) {
  let gameData = $gameData;
  let choiceProvider = $choiceProvider;
  let player = $player;
  $gameData = $choiceProvider = $player = null;

  function go() {
    return choiceProvider.pickSecondDcCard(player)
      .then(handleCard);
  }
  this.go = go;

  function handleCard(card) {
    let finalState = new AllowOpenLot(gameData, choiceProvider, player);
    if(!card) {
      return q(finalState);
    }

    return player.play(gameData, choiceProvider, card)
      .thenResolve(finalState);
  }
}
