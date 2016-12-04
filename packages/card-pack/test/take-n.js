"use strict";

const chai     = require("chai"),
      q        = require("q"),
      _        = require("lodash"),
      dcEngine = require("dc-engine"),
      Player   = dcEngine.Player,
      cardPack = require(".."),
      TakeN    = cardPack.TakeN;

const assert = chai.assert;

describe.only("TakeN", function() {
    let players, me, gameData;

    beforeEach(function() {
        players = [ new Player(0), new Player(0), new Player(0) ];
        me = players[0];
        gameData = { players };
    });

    describe("play", function() {
        it("takes N cards", function() {
            let cards = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ];
            players[1].gainDcCard(cards[0]);
            players[1].gainDcCard(cards[1]);
            players[1].gainDcCard(cards[2]);
            players[2].gainDcCard(cards[3]);
            players[2].gainDcCard(cards[4]);

            let numTaken = 0;

            let choiceProvider = {
                allowTakeCard: function(player) {
                    assert.equal(player, me);

                    switch(numTaken++) {
                        case 0:
                            assert.equal(_.size(me.dcCards), 0);
                            assert.equal(_.size(players[1].dcCards), 3);
                            assert.equal(_.size(players[2].dcCards), 2);
                            return q(players[1]);
                        case 1:
                            assert.equal(_.size(me.dcCards), 1);
                            assert.equal(_.size(players[1].dcCards), 2);
                            assert.equal(_.size(players[2].dcCards), 2);
                            return q(players[2]);
                        case 2:
                            assert.equal(_.size(me.dcCards), 2);
                            assert.equal(_.size(players[1].dcCards), 2);
                            assert.equal(_.size(players[2].dcCards), 1);
                            return q(players[2]);
                        default:
                            throw new Error("Took too many");
                    }
                }
            };

            return new TakeN(3)
                .play(gameData, choiceProvider, me)
                .then(function() {
                    assert.equal(numTaken, 3);
                    assert.equal(_.size(me.dcCards), 3);
                    assert.equal(_.size(players[1].dcCards), 2);
                    assert.equal(_.size(players[2].dcCards), 0);
                });
        });

        it("if fewer cards, takes as many as possible", function() {
            let cards = [ { id: 1 }, { id: 2 }];
            players[1].gainDcCard(cards[0]);
            players[1].gainDcCard(cards[1]);

            let numTaken = 0;

            let choiceProvider = {
                allowTakeCard: function(player) {
                    assert.equal(player, me);

                    switch(numTaken++) {
                        case 0:
                            assert.equal(_.size(me.dcCards), 0);
                            assert.equal(_.size(players[1].dcCards), 2);
                            assert.equal(_.size(players[2].dcCards), 0);
                            return q(players[1]);
                        case 1:
                            assert.equal(_.size(me.dcCards), 1);
                            assert.equal(_.size(players[1].dcCards), 1);
                            assert.equal(_.size(players[2].dcCards), 0);
                            return q(players[1]);
                        default:
                            throw new Error("Took too many");
                    }
                }
            };

            return new TakeN(3)
                .play(gameData, choiceProvider, me)
                .then(function() {
                    assert.equal(numTaken, 2);
                    assert.equal(_.size(me.dcCards), 2);
                    assert.equal(_.size(players[1].dcCards), 0);
                    assert.equal(_.size(players[2].dcCards), 0);
                });
        });
    });

    describe("canPlay", function() {
        it("can be played if any player has a card", function() {
            me.gainDcCard({});
            players[2].gainDcCard({});

            assert.ok(new TakeN(1).canPlay(me, gameData));
        });

        it("can't be played if nobody has a card", function() {
            me.gainDcCard({});

            assert.notOk(new TakeN(1).canPlay(me, gameData));
        });
    });
});