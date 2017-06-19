"use strict";

const Symbols = require("dc-constants").Symbols;

function PresetHelper($preset, $gameData, $choiceProvider) {
    let preset = $preset,
        gameData = $gameData,
        choiceProvider = $choiceProvider;
    $preset = $gameData = $choiceProvider = null;

    function apply() {
        adjustPlayers();
        return createStateFromPreset();
    }
    this.apply = apply;

    function createStateFromPreset() {
        return new preset.state.stateClass(...evaluateStateArgs());
    }

    function evaluateStateArgs() {
        let args = [ gameData, choiceProvider ];
        preset.state.args.forEach(function(arg) {
            switch(arg) {
                case Symbols.player1:
                    args.push(gameData.players[0]);
                    break;
                case Symbols.player2:
                    args.push(gameData.players[1]);
                    break;
                case Symbols.player3:
                    args.push(gameData.players[2]);
                    break;
                case Symbols.player4:
                    args.push(gameData.players[3]);
                    break;
                default:
                    args.push(arg);
                    break;
            }
        });

        return args;
    }

    function adjustPlayers() {
        for(let i = 0; i < gameData.players.length; ++i) {
            let playerPreset = preset.players[i];
            if(!playerPreset)
                break;

            let player = gameData.players[i];
            player.money = playerPreset.money;
            dealLoops(player, playerPreset, dealPresetCards);
        }

        for(let i = 0; i < gameData.players.length; ++i) {
            let playerPreset = preset.players[i];
            if(!playerPreset)
                break;

            dealLoops(gameData.players[i], playerPreset, dealRandomCards);
        }
    }

    function dealLoops(player, playerPreset, dealFunction) {
        playerPreset.dcCards.forEach(
            dealFunction.bind(null, player.gainDcCard, gameData.dcDeck)
        );

        playerPreset.cars.forEach(
            dealFunction.bind(null, player.gainCar, gameData.carDeck)
        );

        playerPreset.insurances.forEach(
            dealFunction.bind(null, player.gainInsurance, gameData.insuranceDeck)
        );
    }

    function dealPresetCards(gainCard, cards, cardPreset) {
        if(cardPreset !== Symbols.random)
            gainCard(cards.pickCard(cardPreset));
    }

    function dealRandomCards(gainCard, cards, cardPreset) {
        if(cardPreset === Symbols.random)
            gainCard(cards.pop());
    }
}

module.exports = function applyPreset(preset, gameData, choiceProvider) {
    return (new PresetHelper(preset, gameData, choiceProvider)).apply();
};