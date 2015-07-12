"use strict";

const dcCardInterfaces = require("dc-card-interfaces"),
      Car              = dcCardInterfaces.Car,
      Insurance        = dcCardInterfaces.Insurance;

function mockDeckConfig(dcCards, insurances, cars) {
  let deckConfig = {
    dcDeck: [{
      constructor: function() {},
      args: [],
      count: dcCards
    }],

    insuranceDeck: [{
      constructor: Insurance,
      args: [],
      count: insurances
    }],

    carDeck: [{
      constructor: Car,
      args: [ 0, 1000 ],
      count: cars
    }]
  };

  return deckConfig;
}

module.exports = mockDeckConfig;