"use strict";

const MessageType = {
  // Lobby commands
  CreateGame: "create",
  JoinGame: "join",
  ListGames: "list",

  // In-game commands
  Chat: "chat",
  Leave: "leave",
  Choice: "choice",
  StartGame: "start-game",

  // S2C Commands
  RockPaperScissors: "rps",
  RpsCountdown: "rpsCountdown",
  RpsConclusion: "rpsConclusion",

  GetTurnChoice: "get-turn-choice",
  NotifyTurnChoice: "notify-turn-choice",

  BuyFromExchangeOption: "replenish",
  BuyFromExchangeResult: "replenish-result",

  PromptForBids: "prompt-for-bids",

  PromptOpenLot: "prompt-open-lot",
  NotifyOpenLot: "notify-open-lot",

  BeginBidding: "begin-bidding",
  BiddingFinished: "bidding-finished",
  NewHighBidder: "new-high-bidder",

  PromptAcceptCounterOffer: "prompt-accept",
  NotifyAcceptedOffer: "notify-accepted"
};

module.exports = MessageType;