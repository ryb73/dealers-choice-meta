"use strict";

const cardPack                = require("dc-card-pack"),
      Attack                  = cardPack.Attack,
      BuyFromAutoExchangeForN = cardPack.BuyFromAutoExchangeForN,
      Free                    = cardPack.Free,
      SellForBlueBookPlusN    = cardPack.SellForBlueBookPlusN,
      SellForListPlusN        = cardPack.SellForListPlusN,
      LotClosed               = cardPack.LotClosed,
      TakeN                   = cardPack.TakeN,
      Cancel                  = cardPack.Cancel,
      dcEngine                = require("dc-engine"),
      Car                     = dcEngine.Car,
      Insurance               = dcEngine.Insurance;

module.exports = {
  "dc-server": {
    port: 3000,
    facebook: {
      appId: "409903325878723",
      appSecret: "e6c47409dfbf573628c9d0aafffd3d25"
    },

    deckConfig: createDeckConfig()
  },

  "dc-db-interface": {
    db: "dc"
  },

  "rpb-logging": {
    outputToFile: true,
  },
};

function createDeckConfig() {
  return {
    dcDeck: createDcCardConfig(),
    carDeck: createCarConfig(),
    insuranceDeck: createInsuranceConfig()
  };
}

function createDcCardConfig() {
  return [{
      constructor: Attack,
      args: [ Attack.fire ],
      count: 3,
      additionalProperties: {
        key: "fire",
        title: "Fire",
        description: "Car destroyed. Force another dealer to send one of his cars of your choice " +
                      "to Auto Discard."
      }
    }, {
      constructor: Attack,
      args: [ Attack.collision ],
      count: 3,
      additionalProperties: {
        key: "collision",
        title: "Collision",
        description: "Force another dealer to return one of his cars of your choice to Auto " +
                      "Exchange or he may pay repair bill of ½ List Price to bank and keep car."
      }
    }, {
      constructor: Attack,
      args: [ Attack.theft ],
      count: 2,
      additionalProperties: {
        key: "theft",
        title: "Car Stolen",
        description: "Force another dealer to return one of his cars of your choice to the Auto " +
                      "Exchange."
      }
    }, {
      constructor: Attack,
      args: [ Attack.rancidPopcorn ],
      count: 1,
      additionalProperties: {
        key: "rancid",
        title: "Rancid Popcorn",
        description: "Attack another car with rancid popcorn."
      }
    }, {
      constructor: BuyFromAutoExchangeForN, // Buy for 200
      args: [ 200 ],
      count: 3,
      additionalProperties: {
        key: "buy200",
        title: "Buy for $200",
        description: "Buy a car from Auto Exchange for $200."
      }
    }, {
      constructor: Free,
      args: [],
      count: 2,
      additionalProperties: {
        key: "free",
        title: "Free",
        description: "Receive one free Insurance Policy."
      }
    }, {
      constructor: SellForBlueBookPlusN, // BB + 3
      args: [ 3000 ],
      count: 1,
      additionalProperties: {
        key: "bb3",
        title: "Blue Book + 3",
        description: "Sell a car for Blue Book price plus $3000."
      }
    }, {
      constructor: SellForBlueBookPlusN, // BB
      args: [ 0 ],
      count: 4,
      additionalProperties: {
        key: "bb",
        title: "Blue Book",
        description: "Sell a car for Blue Book price."
      }
    }, {
      constructor: SellForListPlusN, // List
      args: [ 0 ],
      count: 4,
      additionalProperties: {
        key: "list",
        title: "List",
        description: "Sell a car for List Price."
      }
    }, {
      constructor: SellForListPlusN, // List + 2
      args: [ 2000 ],
      count: 2,
      additionalProperties: {
        key: "list2",
        title: "List + 2",
        description: "Sell a car for List Price plus $2000."
      }
    }, {
      constructor: SellForListPlusN, // List + 3
      args: [ 3000 ],
      count: 1,
      additionalProperties: {
        key: "list3",
        title: "List + 3",
        description: "Sell a car for List Price plus $3000."
      }
    }, {
      constructor: LotClosed,
      args: [],
      count: 2,
      additionalProperties: {
        key: "lot-closed",
        title: "Lot Closed",
        description: "No deal required.\nMay be used to cancel either a \"FORCED SALE\" or \"BUY\" " +
                      "card when it is played on you."
      }
    }, {
      constructor: TakeN,
      args: [ 3 ],
      count: 3, // 1
      additionalProperties: {
        key: "take-3",
        title: "Take 3",
        description: "Take three Dealer's choice cards from any players. Can be used on any player " +
                      "or multiple players."
      }
    }, {
      constructor: Cancel,
      args: [ ],
      count: 2,
      additionalProperties: {
        key: "cancel",
        title: "Cancel",
        description: "Cancel one Insurance Policy of another dealer."
      }
    }];
}

function createCarConfig() {
  let cars = {
    1: 5000,
    2: 3000,
    3: 9000,
    4: 2000,
    5: 10000,
    6: 6000,
    7: 3000,
    8: 4000,
    9: 5000,
    10: 8000,
    11: 6000,
    12: 4000,
    13: 9000,
    14: 2000,
    15: 8000,
    16: 4000,
    17: 2000,
    18: 8000,
    19: 3000,
    20: 5000,
    21: 4000,
    22: 2000,
    23: 3000,
    24: 6000
  };

  let result = [];
  for(let id in cars) {
    result.push({
      constructor: Car,
      args: [ id, cars[id] ],
      count: 1,
      additionalProperties: {
        key: +id,
        image: "car" + id,
        imageSm: "car" + id + "s"
      }
    });
  }

  return result;
}

function createInsuranceConfig() {
  return [{
      constructor: Insurance,
      args: [ Insurance.protections.Fire ],
      count: 2, // TODO: figure out actual number
      additionalProperties: {
        key: "fire",
        title: "Fire",
        value: "Collect List Price"
      }
    },{
      constructor: Insurance,
      args: [ Insurance.protections.Fire, Insurance.protections.Collision,
              Insurance.protections.Theft ],
      count: 1,
      additionalProperties: {
        key: "comprehensive",
        title: "Comprehensive",
        protection: "Fire, Theft, Collision",
        value: "Collect List Price"
      }
    },{
      constructor: Insurance,
      args: [ ],
      count: 1,
      additionalProperties: {
        key: "chickens",
        title: "Fly By Night",
        protection: "Roving Band of Chickens",
        value: "No Value"
      }
    },{
      constructor: Insurance,
      args: [ Insurance.protections.RancidPopcorn ],
      count: 1,
      additionalProperties: {
        key: "rancid",
        title: "Fly By Night",
        protection: "Rancid Popcorn",
        value: "Collect List Price"
      }
    },{
      constructor: Insurance,
      args: [ Insurance.protections.Theft ],
      count: 2,
      additionalProperties: {
        key: "theft",
        title: "Theft",
        value: "Collect List Price"
      }
    },{
      constructor: Insurance,
      args: [ ],
      count: 1,
      additionalProperties: {
        key: "galoshes",
        title: "Fly By Night",
        protection: "Leaky Galoshes",
        value: "No Value"
      }
    },{
      constructor: Insurance,
      args: [ Insurance.protections.Collision ],
      count: 2,
      additionalProperties: {
        key: "collision",
        title: "Collision",
        value: "Collect List Price"
      }
    }];
}