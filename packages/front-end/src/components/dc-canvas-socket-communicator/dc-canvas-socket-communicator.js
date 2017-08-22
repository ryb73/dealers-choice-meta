/* global Polymer, DcShell */
"use strict";

const dcConstants  = require("dc-constants"),
      MessageType  = dcConstants.MessageType,
      q            = require("q"),
      _            = require("lodash"),
      titleCase = require("title-case");

let canvas, socket;

let proto = {
    is: "dc-canvas-socket-communicator",
    properties: {
        gameState: {
            type: Object,
            value: null
        },
        startedRps: Boolean
    },

    attached: function() {
        socket = DcShell.getSocket();
        canvas = this.$.canvas;
        canvas.callbacks = this._generateCallbacks();

        this._onAction = this._onAction.bind(this);
        socket.on("action", this._onAction);
    },

    detached: function() {
        socket.removeListener("action", this._onAction);
    },

    _generateCallbacks: function() {
        return {
            canPlayDcCard: this._canPlayDcCard.bind(this)
        };
    },

    _canPlayDcCard: function(id) {
        let defer = q.defer();

        socket.emit(
            "action",
            {
                cmd: MessageType.CanPlayDcCard,
                cardId: id
            },
            function(res) { defer.resolve(res); }
        );

        return defer.promise;
    },

    _canvasLoaded: function() {
        socket.emit("action", { cmd: MessageType.ActuallyReady });
    },

    _onAction: function(msg) {
        switch(msg.cmd) {
            case MessageType.DealDcCardToPlayer:
                this._dealDcCardToPlayer(msg);
                break;
            case MessageType.DealCarToPlayer:
                this._dealCarToPlayer(msg);
                break;
            case MessageType.DealInsuranceToPlayer:
                this._dealInsuranceToPlayer(msg);
                break;
            case MessageType.RockPaperScissors:
                this._doRockPaperScissors(msg);
                break;
            case MessageType.RpsCountdown:
                this._beginRpsCountdown();
                break;
            case MessageType.RpsConclusion:
                this._handleRpsConclusion(msg);
                break;
            case MessageType.GetTurnChoice:
                this._handleTurnChoice(msg);
                break;
            case MessageType.ChooseOwnCar:
                this._chooseOwnCar(msg);
                break;
            case MessageType.CarSoldToBank:
                this._carSoldToBank(msg);
                break;
            case MessageType.CarBoughtFromBank:
                this._carBoughtFromBank(msg);
                break;
            case MessageType.CardPlayed:
                this._cardPlayed(msg);
                break;
            case MessageType.AllowSecondDcCard:
                this._allowSecondDcCard(msg);
                break;
            case MessageType.AllowTakeCard:
                this._allowTakeCard(msg);
                break;
            case MessageType.MoveCardBetweenPlayers:
                this._moveCardBetweenPlayers(msg);
                break;
            case MessageType.LostPlayer:
                this._lostPlayer(msg);
                break;
            default:
                console.log("Unexpected message type: " + msg.cmd);
        }
    },

    _dealDcCardToPlayer: function(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);
        canvas.giveDcCardFromDeck(playerIdx, msg.dcCard);
    },

    _dealCarToPlayer: function(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);
        canvas.giveCarFromDeck(playerIdx, msg.car);
    },

    _dealInsuranceToPlayer: function(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);
        canvas.giveInsuranceFromDeck(playerIdx, msg.insurance);
    },

    _doRockPaperScissors: function(msg) {
        if(!this.startedRps) {
            this.startedRps = true;
            let chat = "Let's play Rock, Paper, Scissors to see who goes first.";
            if(this.gameState.users.length === 2)
                chat += " Best two out of three!";
            canvas.addChat(chat);
        }

        canvas.getRockPaperScissorsChoice()
            .done(function(move) {
                let newMsg = {
                    cmd: MessageType.Choice,
                    answer: {
                        handlerId: msg.handlerId,
                        move: move
                    }
                };

                socket.emit("action", newMsg);
            }.bind(this));
    },

    _beginRpsCountdown: function() {
        canvas.beginRpsCountdown();
    },

    _handleRpsConclusion: function(msg) {
        canvas.supplyRpsAnswers(msg.answers, msg.survivors, msg.conclusion);
    },

    _handleTurnChoice: function(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);
        if(this._isMe(playerIdx)) {
            canvas.addChat("It's your turn.");
            canvas.getTurnChoice()
                .done(this._sendTurnChoice.bind(this, msg.handlerId));
        } else {
            let playerName = this._getUserByIdx(playerIdx).name;
            canvas.addChat("It's now " + playerName + "'s turn.");
        }
    },

    _sendTurnChoice: function(handlerId, choiceData) {
        let answer = _.cloneDeep(choiceData);
        answer.handlerId = handlerId;

        let msg = {
            cmd: MessageType.Choice,
            answer: answer
        };
        socket.emit("action", msg);
    },

    _allowSecondDcCard: function(msg) {
        canvas.allowSecondDcCard()
            .done(this._sendSecondDcCardChoice.bind(this, msg.handlerId));
    },

    _allowTakeCard: function(msg) {
        canvas.chooseOpponentCard()
            .done((playerId) => {
                this._sendAnswer({
                    playerId,
                    handlerId: msg.handlerId
                });
            });
    },

    _sendAnswer: function(answer) {
        let msg = {
            cmd: MessageType.Choice,
            answer: answer
        };
        socket.emit("action", msg);
    },

    _sendSecondDcCardChoice: function(handlerId, cardId) {
        let msg = {
            cmd: MessageType.Choice,
            answer: {
                handlerId,
                cardId,
                skip: !cardId
            }
        };
        socket.emit("action", msg);
    },

    _chooseOwnCar: function(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);
        if(playerIdx !== 0) return;

        canvas.addChat("Select one of your cars.");
        canvas.chooseOwnCar()
            .done(this._sendCarChoice.bind(this, msg.handlerId));
    },

    _sendCarChoice: function(handlerId, carId) {
        let msg = {
            cmd: MessageType.Choice,
            answer: {
                handlerId: handlerId,
                carId: carId
            }
        };

        socket.emit("action", msg);
    },

    _carSoldToBank: function(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);
        let user = this._getUserByIdx(playerIdx);

        let name = titleCase(this._getDisplayableName(playerIdx));
        canvas.addChat(name + " sold #" + msg.carId + " for $" + msg.amount + ".");

        let carIdx = this._getCarIdxFromId(user.player, msg.carId);
        canvas.discardCar(playerIdx, carIdx);
        canvas.giveMoneyFromBank(playerIdx, msg.amount);
    },

    _carBoughtFromBank: function(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);

        let name = titleCase(this._getDisplayableName(playerIdx));
        canvas.addChat(name + " bought #" + msg.car.id + " for $" + msg.amount + ".");

        canvas.giveCarFromDeck(playerIdx, msg.car);
        canvas.giveMoneyToBank(playerIdx, msg.amount);
    },

    _cardPlayed(msg) {
        let playerIdx = this._getPlayerIdxFromId(msg.playerId);
        let user = this._getUserByIdx(playerIdx);

        let name = titleCase(this._getDisplayableName(playerIdx));
        canvas.addChat(name + " played " + msg.cardTitle + ".");

        if(this._isMe(playerIdx)) {
            let cardIdx = this._getDcCardIdxFromId(user.player, msg.cardId);
            canvas.discardDcCard(playerIdx, cardIdx);
        } else {
            canvas.discardDcCard(playerIdx);
        }
    },

    _moveCardBetweenPlayers(msg) {
        let fromPlayerIdx = this._getPlayerIdxFromId(msg.fromPlayerId);
        let toPlayerIdx = this._getPlayerIdxFromId(msg.toPlayerId);

        let fromName = titleCase(this._getDisplayableName(fromPlayerIdx));
        let toName = this._getDisplayableName(toPlayerIdx);

        let cardTitle;
        if(!this._isMe(fromPlayerIdx) && !this._isMe(toPlayerIdx))
            cardTitle = "Dealer's Choice";
        else
            cardTitle = msg.dcCard.title;

        canvas.addChat(`${fromName} gave ${toName} a ${cardTitle} card.`);

        // Get the card index. Note that this only works if the from player is the current player for now
        let fromUser = this._getUserByIdx(fromPlayerIdx);
        let cardIdx = this._getDcCardIdxFromId(fromUser.player, msg.dcCard.id);

        canvas.moveCardBetweenPlayers(fromPlayerIdx, toPlayerIdx, msg.dcCard, cardIdx);
    },

    _lostPlayer(msg) {
        let user = this._getUserByIdx(this._getUserIdxFromId(msg.userId));
        alert(`${user.name} disconnected`);
        location.reload();
    },

    _getPlayerIdxFromId: function(playerId) {
        return _.findIndex(this.gameState.users, {
            player: {
                id: playerId
            }
        });
    },

    _getUserIdxFromId(userId) {
        return _.findIndex(this.gameState.users, { id: userId });
    },

    _getCarIdxFromId: function(player, carId) {
        return _.findIndex(player.cars, { id: carId });
    },

    _getDcCardIdxFromId: function(player, cardId) {
        return _.findIndex(player.dcCards, { id: cardId });
    },

    _getUserByIdx: function(idx) {
        return this.gameState.users[idx];
    },

    _getDisplayableName(userIdx) {
        if(userIdx === 0)
            return "you";
        else
            return this._getUserByIdx(userIdx).name;
    },

    _isMe(playerIdx) {
        return playerIdx === 0;
    }
};

Polymer(proto);
