"use strict";

const _ = require("lodash");

function BlueBook($carPrices) {
    carPrices = _.cloneDeep($carPrices);

    // Gets the price for the given car
    // Returns undefined if car isn't in blue book
    function getPrice(car) {
        return carPrices[car.id].price;
    }
    this.getPrice = getPrice;

    Object.defineProperties(this, {
        prices: {
            enumerable: true,
            get: () => _.cloneDeep(carPrices)
        }
    });

    $carPrices = null;
}

module.exports = BlueBook;