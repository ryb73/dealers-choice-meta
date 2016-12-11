"use strict";

const BlueBook = require("dc-engine").BlueBook;

function transformBlueBookConfigFromDb(data) {
    return data.map((transformSingle));
}

function transformSingle(carPrices) {
    return {
        constructor: BlueBook,
        args: [ carPrices ],
        count: 1,
    };
}

module.exports = transformBlueBookConfigFromDb;