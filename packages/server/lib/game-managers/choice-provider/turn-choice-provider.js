"use strict";

const giveUniqueId = require("give-unique-id"),
      q            = require("q"),
      _            = require("lodash"),
      dcConstants  = require("dc-constants"),
      MessageType  = dcConstants.MessageType,
      TurnChoice   = dcConstants.TurnChoice;

function TurnChoiceProvider($player) {
  giveUniqueId(this);
  let self = this;

  let player = $player;
  $player = null;

  let callbacks, deferred;

  function handleIt(cb) {
    callbacks = cb;

    console.log("getting turn choice");

    let msg = {
      cmd: MessageType.GetTurnChoice,
      playerId: player.id,
      handlerId: self.id
    };
    callbacks.broadcast("action", msg);

    deferred = q.defer();
    return deferred.promise;
  }
  this.handleIt = handleIt;

  function giveAnswer(answeringPlayer, answer) {
    if(answeringPlayer !== player) return;
    if(!validateAnswer(answer)) return;

    let choiceData = {
      choice: answer.selection
    };

    // DcCard is the only choice that has extra data
    if(answer.selection === TurnChoice.DcCard) {
      choiceData.card = player.dcCards[answer.cardId];
    }

    notifyOthers(answer);

    deferred.resolve(choiceData);
  }
  this.giveAnswer = giveAnswer;

  function notifyOthers(answer) {
    let msg = {
      cmd: MessageType.NotifyTurnChoice,
      playerId: player.id,
      selection: answer.selection,
      cardId: answer.cardId
    };
    callbacks.toOthers(player, "action", msg);
  }

  function validateAnswer(answer) {
    if(!_.includes(TurnChoice, answer.selection))
      return false;
    if(answer.selection === TurnChoice.DcCard && !(answer.cardId in player.dcCards))
      return false;

    return true;
  }
}

module.exports = TurnChoiceProvider;