"use strict";

module.exports = {
  PlayerBox:      require("./lib/player-box"),
  Decks:          require("./lib/decks"),
  assets:         require("./lib/assets"),
  LoadingSplash:  require("./lib/loading-splash"),
  CarFront:       require("./lib/cards/car-front"),
  DcCardFront:    require("./lib/cards/dc-card-front"),
  InsuranceFront: require("./lib/cards/insurance-front"),
  FlippableCard:  require("./lib/cards/flippable-card"),
  BlueBook:       require("./lib/right-hud/blue-book"),
  MyInsurances:   require("./lib/right-hud/my-insurances"),
  MyMoney:        require("./lib/right-hud/my-money"),
  RpsPrompt:      require("./lib/rps/rps-prompt"),
  RpsResults:     require("./lib/rps/rps-results")
};