"use strict";

const dcEngine  = require("dc-engine"),
      Car       = dcEngine.Car,
      Insurance = dcEngine.Insurance,
      MockCard  = require("./mock-card");

function mockDeckConfig(dcCards, insurances, cars) {
    let deckConfig = {
        dcDeck: [{
            constructor: MockCard,
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
        }],

        blueBookDeck: []
    };

    return deckConfig;
}

module.exports = mockDeckConfig;