/* global Polymer, createjs, $ */
"use strict";

const q                  = require("q"),
      _                  = require("lodash"),
      shmutex            = require("shmutex"),
      gameUi             = require("dc-game-ui"),
      Decks              = gameUi.Decks,
      PlayerBox          = gameUi.PlayerBox,
      LoadingSplash      = gameUi.LoadingSplash,
      CarFront           = gameUi.CarFront,
      DcCardFront        = gameUi.DcCardFront,
      InsuranceFront     = gameUi.InsuranceFront,
      FlippableCard      = gameUi.FlippableCard,
      BlueBook           = gameUi.BlueBook,
      MyInsurances       = gameUi.MyInsurances,
      MyMoney            = gameUi.MyMoney,
      RpsPrompt          = gameUi.RpsPrompt,
      RpsResults         = gameUi.RpsResults,
      TurnChoice         = require("dc-constants").TurnChoice,
      AnimationThrottler = require("./animation-throttler");

const TRANSITION_TIME = 500;

let stage; // assume only one canvas per page
let decks, blueBook, bgBmp, myInsurances, myMoney;
let displayedCard, modal;
let lastSelectedOpponentCardIdx;
let animationThrottler = new AnimationThrottler(300);

const mutexDcCards = shmutex();

// Given an object and point relating to that object,
// returns a set of coords representing the same point with
// respect to the parent.
// TODO: refactor out
// TODO: provide more explanation, visuals?
function normalizeCoords(dispObj, coords) {
    var focalAngleRad = dispObj.rotation * Math.PI / 180;
    var oppositeRad = (Math.PI - focalAngleRad) / 2;

    // Distance from register point to coords
    var relX = coords.x - dispObj.regX;
    var relY = dispObj.regY - coords.y; // opposite of cartesian
    var distFromFocal = Math.sqrt(Math.pow(relX, 2) +
                        Math.pow(relY, 2));
    if(relX < 0) distFromFocal = -distFromFocal;

    // Distance between the relative and normalized point
    var pointDistance;
    if(oppositeRad !== 0)
        pointDistance = distFromFocal * Math.sin(focalAngleRad) /
                        Math.sin(oppositeRad);
    else
        pointDistance =  distFromFocal * 2;

    var totalRelativeRad = 0;
    if(distFromFocal !== 0)
        totalRelativeRad = Math.asin(relY / distFromFocal);

    var xRad = (Math.PI / 2) - focalAngleRad - oppositeRad +
                            totalRelativeRad;

    var x = Math.sin(xRad) * pointDistance +
            coords.x - dispObj.regX + dispObj.x;
    var y = Math.cos(xRad) * pointDistance +
            coords.y - dispObj.regY + dispObj.y;

    var rotation = coords.rotation || 0;
    rotation += dispObj.rotation;

    return {
        x: x,
        y: y,
        rotation: rotation
    };
}

function denormalizeCoords(dispObj, coords) {
    var focalAngleRad = dispObj.rotation * Math.PI / 180;
    var oppositeRad = (Math.PI - focalAngleRad) / 2;

    // Distance from register point to coords
    var relX = coords.x - dispObj.x;
    var relY = dispObj.y - coords.y; // opposite of cartesian
    var distFromFocal = Math.sqrt(Math.pow(relX, 2) +
                        Math.pow(relY, 2));
    if(relX < 0) distFromFocal = -distFromFocal;

    // Distance between the relative and normalized point
    var pointDistance;
    if(oppositeRad !== 0)
        pointDistance = distFromFocal * Math.sin(focalAngleRad) /
                        Math.sin(oppositeRad);
    else
        pointDistance =  distFromFocal * 2;

    var totalRelativeRad = 0;
    if(distFromFocal !== 0)
        totalRelativeRad = Math.asin(relY / distFromFocal) + focalAngleRad;

    var xRad = (Math.PI / 2) - focalAngleRad - oppositeRad +
                totalRelativeRad;

    var x = -Math.sin(xRad) * pointDistance +
            coords.x + dispObj.regX - dispObj.x;
    var y = -Math.cos(xRad) * pointDistance +
            coords.y + dispObj.regY - dispObj.y;

    var rotation = coords.rotation || 0;
    rotation -= dispObj.rotation;

    return {
        x: x,
        y: y,
        rotation: rotation
    };
}

var proto = {
    is: "dc-game-canvas",
    properties: {
        gameState: Object,

        loaded: {
            type: Boolean,
            value: false
        },

        debugMode: Boolean,
        messages: Array,
        callbacks: Array
    },

    attached: function() {
        var canvas = this.$.gameCanvas;
        stage = new createjs.Stage(canvas);
        stage.enableMouseOver();

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", stage);

        this._setCanvasSize();
        $(window).resize(this._setCanvasSize.bind(this));

        this._setup();
    },

    refresh: function() {
        if(this.loaded) {
            this._refreshDeck();
            this._refreshPlayers();
            this._refreshRightHud();
            this._refreshBg();
            this._refreshModal();
            stage.update();
        }
    },

    addPlayer: function(user) {
        user.dispObjs = user.dispObjs || {};
        this.gameState.users.push(user);
        this.refresh();
    },

    removePlayerAtIndex: function(index) {
        var user = this.gameState.users[index];
        for(var key in user.dispObjs) {
            if(user.dispObjs.hasOwnProperty(key)) {
                stage.removeChild(user.dispObjs[key]);
            }
        }

        this.gameState.users.splice(index, 1);
        this.refresh();
    },

    giveCarFromDeck: animated(function(userIdx, car) {
        var user = this.gameState.users[userIdx];
        user.player.cars.push(car);

        // Make room for the new car and get the new car's
        // coords. The coords will be in relation to the
        // player box; we want them in relation to the decks.
        var playerBox = user.dispObjs.playerBox;
        var carCoords = playerBox.makeSpaceForCar(TRANSITION_TIME);
        carCoords = normalizeCoords(playerBox, carCoords);
        carCoords.x -= decks.x - decks.regX;
        carCoords.y -= decks.y - decks.regY;

        var qNewCard = decks.giveCar(car, carCoords, TRANSITION_TIME);
        return playerBox.putCarInBlankSpace(qNewCard);
    }),

    //TODO: this looks very similar to giveCarFromDeck. refactor?
    giveDcCardFromDeck: animated(function(userIdx, dcCard) {
        console.log("-givedccard-");
        return mutexDcCards.lock(() => {
            var user = this.gameState.users[userIdx];
            user.player.dcCards.push(dcCard);

            // Make room for the new card
            var playerBox = user.dispObjs.playerBox;
            var cardCoords = playerBox.makeSpaceForDcCard(TRANSITION_TIME);
            cardCoords = normalizeCoords(playerBox, cardCoords);
            cardCoords.x -= decks.x - decks.regX;
            cardCoords.y -= decks.y - decks.regY;

            var qNewCard = decks.giveDcCard(
                dcCard, cardCoords, TRANSITION_TIME, this._isMe(userIdx)
            );
            return playerBox.putDcCardInBlankSpace(qNewCard)
                .tap(console.log.bind(console, "-end givedccard-"));
        });
    }),

    giveInsuranceFromDeck: animated(function(userIdx, insurance) {
        var user = this.gameState.users[userIdx];
        user.player.insurances.push(insurance);

        var cardCoords;
        if(this._isMe(userIdx)) {
            cardCoords = myInsurances.makeSpaceForCard(TRANSITION_TIME);
            cardCoords = normalizeCoords(myInsurances, cardCoords);
            cardCoords.x -= decks.x - decks.regX;
            cardCoords.y -= decks.y - decks.regY;

            var qNewCard = decks.giveInsurance(insurance, cardCoords, TRANSITION_TIME);
            return myInsurances.putCardInBlankSpace(qNewCard);
        } else {
            var insuranceAnimData = decks.getInsuranceToGive();

            // We'll get the coords with respect to decks -- normalize them
            cardCoords = insuranceAnimData.coords;
            cardCoords.x += decks.x - decks.regX;
            cardCoords.y += decks.y - decks.regY;

            var playerBox = user.dispObjs.playerBox;
            cardCoords = denormalizeCoords(playerBox, cardCoords);
            return playerBox.giveInsurance(insuranceAnimData.insuranceDisp, cardCoords, TRANSITION_TIME);
        }
    }),

    discardCar: function(userIdx, carIdx) { return this.discardCarImpl(userIdx, carIdx); },
    discardCarImpl: animated(function(userIdx, carIdx) {
        let user = this.gameState.users[userIdx];
        let playerBox = user.dispObjs.playerBox;
        let carAnimData = playerBox.removeCar(carIdx, TRANSITION_TIME);

        let normalizedCoords = normalizeCoords(playerBox, carAnimData.coords);
        let deckCoords = denormalizeCoords(decks, normalizedCoords);

        return decks.discardCar(carAnimData.carDisp, deckCoords, TRANSITION_TIME);
    }),

    discardDcCard: function(userIdx, cardIdx) {
        let user = this.gameState.users[userIdx];
        let playerBox = user.dispObjs.playerBox;

        // Sad hack. Basically the animation happens asynchronously but messages can still process, so
        // e.g. if the player can play another card, the one being removed now has to be ignored
        playerBox.disableDcCard(cardIdx);

        return animated((userIdx, cardIdx) => {
            let dcCardAnimData;
            user.player.dcCards.splice(cardIdx, 1);

            if(this._isMe(userIdx))
                dcCardAnimData = playerBox.removeDcCard(cardIdx, TRANSITION_TIME);
            else
                dcCardAnimData = playerBox.removeRandomDcCard(TRANSITION_TIME);

            let normalizedCoords = normalizeCoords(playerBox, dcCardAnimData.coords);
            let deckCoords = denormalizeCoords(decks, normalizedCoords);

            return decks.discardDcCard(dcCardAnimData.cardDisp, deckCoords, TRANSITION_TIME);
        })(userIdx, cardIdx);
    },

    giveMoneyFromBank: function(playerIdx, amount) {
        this._getPlayer(playerIdx).money += amount;
        this._refreshRightHud();
    },

    giveMoneyToBank: function(playerIdx, amount) {
        this._getPlayer(playerIdx).money -= amount;
        this._refreshRightHud();
    },

    // Determines whether the player at the given index
    // is the current (i.e. local) player
    _isMe: function(idx) {
        return idx === 0;
    },

    _setup: function() {
        this.messages = [];

        this._createBackground();

        this._loadAssets()
            // .catch(function() {
                //TODO: log error
            // })
            .done(function() {
                this.loaded = true;

                this.gameState.users.forEach(function(user) {
                    user.dispObjs = {};
                });

                this._createPlayers();
                this._createDecks();
                this._createRightHud();
                stage.update();

                this.fire("load");
            }.bind(this));
    },

    _loadAssets: function() {
        var loadingSplash = new LoadingSplash();
        this._showModal(loadingSplash);

        return loadingSplash.load()
            .tap(() => {
                this._removeModal();
            });
    },

    _createBackground: function() {
        bgBmp = new createjs.Bitmap("/images/game-bg.png");
        bgBmp.image.addEventListener("load", () => {
            this._refreshBg();
            stage.addChildAt(bgBmp, 0);
        });
    },

    _refreshBg: function() {
        bgBmp.scaleX = bgBmp.scaleY = 1;
        var bgBounds = bgBmp.getBounds();
        var scaleW = this._width() / bgBounds.width;
        var scaleH = this._height() / bgBounds.height;
        bgBmp.scaleX = bgBmp.scaleY = Math.max(scaleW, scaleH);
    },

    _createDecks: function() {
        decks = new Decks();
        this._refreshDeck();
        stage.addChild(decks);
    },

    _refreshDeck: function() {
        decks.x = 10;
        decks.y = this._height() / 2;
    },

    _createRightHud: function() {
        blueBook = new BlueBook();

        myInsurances = new MyInsurances(this._getMyUser().player.insurances);
        myInsurances.on("card-mouseover", this._insuranceMouseOver.bind(this));
        myInsurances.on("card-mouseout", this._removeDisplayedCard.bind(this));

        myMoney = new MyMoney(this._getMyUser().player);

        this._refreshRightHud();

        stage.addChild(blueBook);
        stage.addChild(myMoney);
        stage.addChild(myInsurances);
    },

    _refreshRightHud: function() {
        var bbBounds = blueBook.getBounds();
        blueBook.x = this._width() - bbBounds.x - bbBounds.width - 10;
        blueBook.y = this._height() - bbBounds.y - bbBounds.height - 10;

        var moneyBounds = myMoney.getBounds();
        myMoney.x = blueBook.x;
        myMoney.y = blueBook.y - 10 - moneyBounds.height;
        myMoney.updateMoney();

        myInsurances.x = myMoney.x;
        myInsurances.y = myMoney.y - 10;
    },

    _createPlayers: function() {
        this._refreshPlayers();
    },

    _refreshPlayers: function() {
        this.gameState.users.forEach(
            this._positionPlayer.bind(this)
        );

        this._positionDisplayedCard();
    },

    _positionPlayer: function(user, idx) {
        var coords = this._getCoordsForPlayer(idx);
        var rotationDeg = coords.rotationRad *
                                        180 / Math.PI;

        var playerBox = user.dispObjs.playerBox;
        if(!playerBox) {
            playerBox = this._addNewPlayerToStage(user, idx);
        }

        playerBox.setRotation(rotationDeg);

        playerBox.x = coords.x;
        playerBox.y = coords.y;
        playerBox.rotation = rotationDeg;

        if(this.debugMode) this._textAt(user, idx, coords);
    },

    _addNewPlayerToStage: function(user, idx) {
        var playerBox = user.dispObjs.playerBox = new PlayerBox(user, idx === 0, this.debugMode, this.callbacks);
        stage.addChildAt(playerBox, 1);

        playerBox.on("car-mouseover", this._carMouseOver.bind(this, idx));
        playerBox.on("car-mouseout", this._removeDisplayedCard.bind(this));
        playerBox.on("dc-card-mouseover", this._dcCardMouseOver.bind(this, idx));
        playerBox.on("dc-card-mouseout", this._removeDisplayedCard.bind(this));

        return playerBox;
    },

    _carMouseOver: function(userIdx, carEvent) {
        this._showCar(this._getPlayer(userIdx).cars[carEvent.carIndex]);
    },

    _dcCardMouseOver: function(userIdx, cardEvent) {
        if(this._isMe(userIdx))
            this._showDcCard(this._getPlayer(userIdx).dcCards[cardEvent.cardIndex]);
    },

    _dcCardMouseOut: function(userIdx, cardEvent) {
        stage.removeChild(displayedCard);
        displayedCard = null;
    },

    _insuranceMouseOver: function(cardEvent) {
        this._showInsurance(this._getPlayer(0).insurances[cardEvent.cardIndex]);
    },

    _removeDisplayedCard: function() {
        stage.removeChild(displayedCard);
        displayedCard = null;
    },

    // Gets the player object for the specified user
    _getPlayer: function(userIdx) {
        return this.gameState.users[userIdx].player;
    },

    _showCar: function(car) {
        if(displayedCard)
            this._removeDisplayedCard();

        displayedCard = new CarFront(car, true);
        this._positionDisplayedCard();
        stage.addChild(displayedCard);
    },

    _showDcCard: function(dcCard) {
        if(displayedCard)
            this._removeDisplayedCard();

        displayedCard = new DcCardFront(dcCard, true);
        this._positionDisplayedCard();
        stage.addChild(displayedCard);
    },

    _showInsurance: function(insurance) {
        if(displayedCard)
            this._removeDisplayedCard();

        displayedCard = new InsuranceFront(insurance, true);
        this._positionDisplayedCard();
        stage.addChild(displayedCard);
    },

    _positionDisplayedCard: function() {
        if(displayedCard) {
            var coords = this._getCenter();
            displayedCard.x = coords.x;
            displayedCard.y = coords.y;
        }
    },

    getRockPaperScissorsChoice: function() {
        var rpsPrompt = new RpsPrompt();
        this._showModal(rpsPrompt);

        return rpsPrompt.getSelection()
            .tap(this._showRpsResultsModal.bind(this));
    },

    beginRpsCountdown: function() {
        modal.beginCountdown();
    },

    _showRpsResultsModal: function(myChoice) {
        var rpsResults = new RpsResults(this.gameState.users, myChoice);
        this._showModal(rpsResults);
    },

    supplyRpsAnswers: function(answers, survivors, conclusion) {
        var rpsResults = modal;
        rpsResults.setAnswers(answers, survivors, conclusion);
        q.delay(5000)
            .done(function() {
                stage.removeChild(rpsResults);
            });
    },

    _showModal: function(dispObj) {
        if(modal) {
            stage.removeChild(modal);
        }

        modal = dispObj;
        this._refreshModal();
        stage.addChild(modal);
        stage.update();
    },

    _removeModal: function() {
        stage.removeChild(modal);
        modal = null;
        stage.update();
    },

    _refreshModal: function() {
        if(modal) {
            modal.x = this._width() / 2;
            modal.y = this._height() / 2;
        }
    },

    addChat: function(s) {
        this.push("messages", s);
        Polymer.dom.flush();
        this.$.chat.scrollTop = this.$.chat.scrollHeight;
    },

    getTurnChoice: animated(function() {
        console.log("-getturnchoice-");
        return mutexDcCards.lock(() => {
            var playerBox = this._getMyUser().dispObjs.playerBox;
            var qDcCardId = playerBox.askForDcCardToPlay();
            return qDcCardId
                .then((cardId) => {
                    return {
                        selection: TurnChoice.DcCard,
                        cardId: cardId
                    };
                })
                .tap(console.log.bind(console, "-end getTurnChoice-"));
        }, true);
    }),

    allowSecondDcCard: function() {
        console.log("-allowseconddccard-");
        return mutexDcCards.lock(() => {
            let playerBox = this._getMyUser().dispObjs.playerBox;

            return playerBox.askForDcCardToPlay()
                .then(function(cardId) {
                    return cardId;
                })
                .tap(console.log.bind(console, "-end allowSecondDcCard-"));
        }, true);
    },

    chooseOpponentCard: function() {
        console.log("-chooseOpponentCard-");
        return mutexDcCards.lock(() => {
            let otherPlayerBoxes = this.getOtherPlayerBoxes();
            let qCards = _.invokeMap(otherPlayerBoxes, "askForDcCard");
            return q.race(qCards)
                .tap(() => _.invokeMap(otherPlayerBoxes, "stopAskingForDcCard"))
                .then(({ playerId, cardIdx }) => {
                    lastSelectedOpponentCardIdx = cardIdx; // I hate this
                    return playerId;
                })
                .tap(console.log.bind(console, "-end chooseOpponentCard-"));
        }, true);
    },

    getOtherPlayerBoxes: function() {
        return _(this.gameState.users)
            .tail()
            .map("dispObjs.playerBox")
            .value();
    },

    chooseOwnCar: function() {
        var playerBox = this._getMyUser().dispObjs.playerBox;
        return playerBox.askForCar();
    },

    moveCardBetweenPlayers(fromPlayerIdx, toPlayerIdx, card, cardIdx) {
        console.log("-moveCardBetweenPlayers-");
        return mutexDcCards.lock(() => {
            let fromUser = this.gameState.users[fromPlayerIdx];
            let fromPlayerBox = fromUser.dispObjs.playerBox;

            let toUser = this.gameState.users[toPlayerIdx];
            let toPlayerBox = toUser.dispObjs.playerBox;

            if(cardIdx < 0)
                cardIdx = lastSelectedOpponentCardIdx;

            fromUser.player.dcCards.splice(cardIdx, 1);
            toUser.player.dcCards.push(card);

            let { cardDisp, coords: fromCoords } = fromPlayerBox.removeDcCard(cardIdx, TRANSITION_TIME);
            cardDisp.parent.removeChild(cardDisp);
            fromCoords = normalizeCoords(fromPlayerBox, fromCoords);
            fromCoords = denormalizeCoords(toPlayerBox, fromCoords);
            fromCoords.y -= cardDisp.regY;

            let needToFlip = this._isMe(fromPlayerIdx) || this._isMe(toPlayerIdx);
            if(needToFlip && !this._isMe(fromPlayerIdx))
                cardDisp = this._makeFlippableDcCard(card);

            cardDisp.set(fromCoords);

            toPlayerBox.makeSpaceForDcCard(TRANSITION_TIME);
            let res = toPlayerBox.putDcCardInBlankSpace(cardDisp, TRANSITION_TIME);

            if(needToFlip)
                cardDisp.flip(TRANSITION_TIME / 4);
            else
                console.log("it ain't me");

            return res
                .tap(console.log.bind(console, "-end moveCardBetweenPlayers-"));
        }, true);
    },

    _makeFlippableDcCard(card) {
        let back = decks.createDcCardBack();
        let front = new DcCardFront(card);
        return new FlippableCard(back, front);
    },

    _getMyUser: function() {
        return this.gameState.users[0];
    },

    _textAt: function(user, txt, coords) {
        if(!user.dispObjs.point) {
            user.dispObjs.point = new createjs.Shape();
            user.dispObjs.point.graphics.beginFill("red")
                .drawRect(0, 0, 5, 5);
            stage.addChild(user.dispObjs.point);

            user.dispObjs.pointLabel = new createjs.Text(txt, "16px Arial", "#000");
            stage.addChild(user.dispObjs.pointLabel);
        }

        user.dispObjs.point.x = coords.x - 2;
        user.dispObjs.point.y = coords.y - 2;

        user.dispObjs.pointLabel.x = coords.x;
        user.dispObjs.pointLabel.y = coords.y;
    },

    _getCenter: function() {
        return {
            x: this._width() / 2,
            y: this._height() / 2 + 25
        };
    },

    _getPlayerBoxByIndex: function(playerIdx) {
        return this.gameState.users[playerIdx].dispObjs.playerBox;
    },

    _getCoordsForPlayer: function(playerIndex) {
        var origin = this._getCenter();

        var majorRad = (this._width() * 0.6) / 2;
        var minorRad = (this._height() * 0.6) / 2;

        var anglePerPlayer = 2 * Math.PI / this.gameState.users.length;

        var angle = (anglePerPlayer * playerIndex) +
            Math.PI / 2; // begin at bottom of screen

        return {
            x: origin.x + Math.cos(angle) * majorRad,
            y: origin.y + Math.sin(angle) * minorRad,

            // Our starting angle is Math.PI / 2, at which point
            // we have zero rotation. As we go around the circle,
            // the player box should rotate at the same rate
            rotationRad: angle - Math.PI / 2
        };
    },

    _setCanvasSize: function() {
        this.$.gameCanvas.width = 0;
        this.$.gameCanvas.height = 0;
        this.$.gameCanvas.width = this.clientWidth;
        this.$.gameCanvas.height = this.clientHeight;
        this.refresh();
    },

    _width: function() {
        return this.$.gameCanvas.width;
    },

    _height: function() {
        return this.$.gameCanvas.height;
    }
};

Polymer(proto);

function animated(fn) {
    return function() {
        var fnArgs = Array.prototype.slice.call(arguments, 0);
        var bindArgs = [ this ].concat(fnArgs);
        return animationThrottler
            .requestAnim(fn.bind.apply(fn, bindArgs));
    };
}
