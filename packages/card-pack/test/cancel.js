"use strict";

const chai     = require("chai"),
      q        = require("q"),
      _        = require("lodash"),
      dcEngine = require("dc-engine"),
      Player   = dcEngine.Player,
      cardPack = require(".."),
      Cancel   = cardPack.Cancel;

const assert = chai.assert;

describe.only("Cancel", function() {
    let players, me, gameData;

    beforeEach(function() {
        players = [ new Player(0), new Player(0), new Player(0) ];
        me = players[0];
        gameData = { players };
    });

    describe("play", function() {
        it("cancels selected opponent's insurance", function() {
            let cards = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ];
            players[1].gainInsurance(cards[0]);
            players[1].gainInsurance(cards[1]);
            players[1].gainInsurance(cards[2]);
            players[2].gainInsurance(cards[3]);
            players[2].gainInsurance(cards[4]);

            let choiceProvider = {
                allowPickPlayerWithInsurance: function(player) {
                    assert.equal(player, me);
                    return q(players[1]);
                }
            };

            return new Cancel()
                .play(gameData, choiceProvider, me)
                .then(function() {
                    assert.equal(_.size(players[1].insurances), 2);
                    assert.equal(_.size(players[2].insurances), 2);
                });
        });
    });

    describe("canPlay", function() {
        it("can be played if any player has an insurance", function() {
            players[2].gainInsurance({});

            assert.ok(new Cancel().canPlay(me, gameData));
        });

        it("can't be played if nobody has an insurance", function() {
            me.gainDcCard({});

            assert.notOk(new Cancel().canPlay(me, gameData));
        });
    });
});