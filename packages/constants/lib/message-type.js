"use strict";

const MessageType = {
  // Universal commands
  // C2S
  Chat: "chat",
  Disconnect: "disconnect",

  // S2C
  ChatSent: "chat-sent",

  // Lobby commands
  // C2S
  CreateGame: "create",
  JoinGame: "join",
  ListGames: "list-games",
  RegisterUser: "register-user",

  // S2C
  UserEnteredLobby: "user-entered",
  UserLeftLobby: "user-left",

  // In-game commands
  // C2S
  Leave: "leave",
  Choice: "choice",
  StartGame: "start-game",

  // S2C
  PlayerJoined: "player-joined",

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