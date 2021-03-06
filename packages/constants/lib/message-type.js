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
  GetPresets: "get-presets",

  // S2C
  UserEnteredLobby: "user-entered",
  UserLeftLobby: "user-left",
  PendingGameUpdated: "pending-game-updated",
  LobbyUpdated: "lobby-updated",

  // In-game commands
  // C2S
  Leave: "leave",
  Choice: "choice",
  StartGame: "start-game",
  ActuallyReady: "actually-ready",
  GetState: "get-state",
  CanPlayDcCard: "can-play-dc-card",

  // S2C
  PlayerJoined: "player-joined",
  GameStarted: "game-started",

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
  NotifyAcceptedOffer: "notify-accepted",

  DealDcCardToPlayer: "deal-dc-card-to-player",
  DealCarToPlayer: "deal-car-to-player",
  DealInsuranceToPlayer: "deal-insurance-to-player",
  MoveCardBetweenPlayers: "move-card-between-players",

  ChooseOwnCar: "choose-own-car",

  CarSoldToBank: "car-sold-to-bank",
  CarBoughtFromBank: "car-bought-from-bank",
  CardPlayed: "card-played",

  AllowSecondDcCard: "allow-second-dc-card",

  AllowTakeCard: "allow-take-card",

  LostPlayer: "lost-player",
};

module.exports = MessageType;