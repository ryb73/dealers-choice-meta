"use strict";

const Symbols = require("dc-constants").Symbols;

function PresetHelper(preset, gameData, choiceProvider) {
    function createStateFromPreset() {
        return new preset.state.class(...evaluateStateArgs());
    }
    this.createStateFromPreset = createStateFromPreset;

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

    function adjustPlayer(player, playerPreset, gameData) {
        player.money = playerPreset.money;

        playerPreset.dcCards.forEach(
            adjustCards.bind(null, player.gainDcCard, gameData.dcDeck)
        );

        playerPreset.cars.forEach(
            adjustCards.bind(null, player.gainCar, gameData.carDeck)
        );

        playerPreset.insurances.forEach(
            adjustCards.bind(null, player.gainInsurance, gameData.insuranceDeck)
        );

        console.log("final cards ", player.dcCards);
    }
    this.adjustPlayer = adjustPlayer;

    function adjustCards(gainCard, cards, cardPreset) {
        let card;
        if(cardPreset === Symbols.random) {
            card = cards.pop();
            console.log("popped card ", card);
        }
        else {
            card = cards.pickCard(cardPreset);
            console.log("picked " + cardPreset + " ", card);
        }

        gainCard(card);
    }
}

module.exports = PresetHelper;