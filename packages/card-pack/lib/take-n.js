"use strict";

const _            = require("lodash"),
      giveUniqueId = require("give-unique-id");

function TakeN(n) {
    giveUniqueId(this);

    function play(gameData, choiceProvider, player) {
        return choiceProvider.allowTakeCard(player)
            .then(doTake.bind(null, player))
            .then(maybeTakeAgain.bind(null, gameData, choiceProvider, player));
    }
    this.play = play;

    function canPlay(player, gameData) {
        return getTotalOpponentCards(player, gameData) > 0;
    }
    this.canPlay = canPlay;

    function getTotalOpponentCards(player, gameData) {
        let totalNumCards = _(gameData.players)
            .map("dcCards")
            .map(_.size)
            .sum();

        return totalNumCards - _.size(player.dcCards);
    }

    function doTake(taker, target) {
        let card = _.sample(target.dcCards);
        taker.takeDcCard(target, card);
    }

    function maybeTakeAgain(gameData, choiceProvider, player) {
        if(n === 1)
            return;

        let virtualCard = new TakeN(n - 1);
        if(!virtualCard.canPlay(player, gameData))
            return;

        return virtualCard.play(gameData, choiceProvider, player);
    }
}

module.exports = TakeN;
