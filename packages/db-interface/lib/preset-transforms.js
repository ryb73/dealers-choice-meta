"use strict";

const _          = require("lodash"),
      gameStates = require("dc-game-states"),
      symbols    = require("dc-constants").Symbols;

function transformPresetFromDb(dbPreset) {
    let result = _.clone(dbPreset);

    result.state.stateClass = gameStates[dbPreset.state.stateClass];

    result.state.args = dbPreset.state.args.map((arg) => {
        if(!arg.startsWith("PLAYER_"))
            return arg;

        let playerNum = arg.split("_")[1];
        return symbols["player" + playerNum];
    });

    result.players = mapPlayers(dbPreset.players);

    return result;
}

function mapPlayers(players) {
    return players.map((player) => {
        let result = _.clone(player);
        result.dcCards = mapRandom(player.dcCards);
        result.cars = mapRandom(player.cars);
        result.insurances = mapRandom(player.insurances);
        return result;
    });
}

function mapRandom(arr) {
    return arr.map((item) => {
        if(item === null)
            return symbols.random;

        return item;
    });
}

module.exports =  { transformPresetFromDb };