"use strict";

const _            = require("lodash"),
      giveUniqueId = require("give-unique-id");

function Cancel(n) {
    giveUniqueId(this);

    function play(gameData, choiceProvider, player) {
        return choiceProvider.allowPickPlayerWithInsurance(player)
            .then(doCancel.bind(null));
    }
    this.play = play;

    function canPlay(player, gameData) {
        return getTotalOpponentInsurances(player, gameData) > 0;
    }
    this.canPlay = canPlay;

    function getTotalOpponentInsurances(player, gameData) {
        let totalNumCards = _(gameData.players)
            .map("insurances")
            .map(_.size)
            .sum();

        return totalNumCards - _.size(player.insurances);
    }

    function doCancel(target) {
        let card = _.sample(target.insurances);
        target.loseInsurance(card);
    }
}

module.exports = Cancel;
