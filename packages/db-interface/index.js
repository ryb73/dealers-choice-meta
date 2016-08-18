"use strict";

let q          = require("q"),
    _          = require("lodash"),
    gameStates = require("dc-game-states"),
    Symbols    = require("dc-constants").Symbols;

function createDbInterface() {
    let presets = [{
        id: 1,
        name: "Basic Game",
        state: {
            class: gameStates.PlayerTurnBeginState,
            args: [ Symbols.player1 ]
        },
        players: [{
            money: 17000,
            dcCards: [ "list3", ..._.fill(new Array(4), Symbols.random) ],
            cars: [ 24 , ..._.fill(new Array(3), Symbols.random) ],
            insurances: [ "fire" ]
        }, {
            money: 17000,
            dcCards: _.fill(new Array(5), Symbols.random),
            cars: _.fill(new Array(4), Symbols.random),
            insurances: [ Symbols.random ]
        }]
    }];

    function getPreset(id) {
        let defer = q.defer();

        let preset = _.find(presets, { id });
        if(preset)
            defer.resolve(preset);
        else
            defer.reject(new Error("Invalid preset ID: " + id));

        return defer.promise;
    }

    function getPresets() {
        let defer = q.defer();

        let presetData = presets.map((preset) => (
            {
                id: preset.id,
                name: preset.name
            }
        ));
        defer.resolve(presetData);

        return defer.promise;
    }

    return { getPreset, getPresets };
}

module.exports = createDbInterface();