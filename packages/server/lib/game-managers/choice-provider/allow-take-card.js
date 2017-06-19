"use strict";

const giveUniqueId = require("give-unique-id"),
      q            = require("q"),
      dcConstants  = require("dc-constants"),
      MessageType  = dcConstants.MessageType;

function AllowTakeCard($game, $player) {
    giveUniqueId(this);
    let self = this;

    let game = $game,
            player = $player;
    $game = $player = null;

    let callbacks, deferred;

    function handleIt(cb) {
        callbacks = cb;

        let msg = {
            cmd: MessageType.AllowTakeCard,
            handlerId: self.id
        };
        callbacks.toYou(player, "action", msg);

        deferred = q.defer();
        return deferred.promise;
    }
    this.handleIt = handleIt;

    function giveAnswer(answeringPlayer, answer) {
        if(answeringPlayer !== player) return;

        let targetPlayer = getTargetPlayer(answer);
        if(!targetPlayer) return;

        deferred.resolve(targetPlayer);
    }
    this.giveAnswer = giveAnswer;

    function getTargetPlayer(answer) {
        let playerIdx = game.getPlayerIndexById(answer.playerId);
        if(!playerIdx)
            return null;

        return game.players[playerIdx];
    }
}

module.exports = AllowTakeCard;