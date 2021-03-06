"use strict";

const config         = require("config").get("dc-server"),
      _              = require("lodash"),
      dcConstants    = require("dc-constants"),
      MessageType    = dcConstants.MessageType,
      ResponseCode   = dcConstants.ResponseCode,
      dbInterface    = require("dc-db-interface"),
      validateUserId = config.validateUserId || require("./validate-user-id"),
      log            = require("rpb-logging")("dc-server"),
      GameManager    = require("./game-managers/pending-game-manager");

function ConnectionHandler($io, $socket, $serverState) {
    let io = $io;
    let socket = $socket;
    let serverState = $serverState;

    let player, manager, userId;

    function initialize() {
        log.info("a user connected");

        socket.on("action", (msg, ack) => {
            log.trace("message: " + JSON.stringify(msg));

            if(manager) {
                performInGameCommand(msg, ack);
            } else {
                performLobbyCommand(msg, ack);
            }
        });

        socket.on("disconnect", () => {
            log.info("user [" + userId + "] disconnected");

            disconnectPlayer();
        });

        $io = $socket = $serverState = null;
    }

    // Commands:
    //  CreateGame
    //   Creates (and joins) a new game.
    //   ack: {
    //    result:          CreateOk,
    //    playerId:        player ID,
    //    gameDescription: LobbyDescription
    //   }
    //
    //  JoinGame
    //   Joins an existing game.
    //   input: { id: game ID }
    //   ack: {
    //    result:          JoinOk | JoinGameNotFound | JoinGameFull,
    //    playerId:        player ID, if joined
    //    gameDescription: LobbyDescription
    //    gameState:       game state obj
    //   }
    //
    //  ListGames
    //   Lists all games, open or not.
    //   ack: [ LobbyDescription ]
    //
    //  RegisterUser
    //   Moves the player into the lobby.
    //   input: { userId: user ID }
    //   ack:   nothing
    //
    //  Disconnect
    //   Disconnects the client. This is necessary because
    //   there's no way to disconnect on the client side using
    //   socket.io.
    function performLobbyCommand(msg, ack) {
        if(msg.cmd === MessageType.CreateGame) {
            createCmd(socket, ack);
        } else if(msg.cmd === MessageType.JoinGame) {
            joinCmd(msg, socket, ack);
        } else if(msg.cmd === MessageType.ListGames) {
            listCmd(ack);
        } else if(msg.cmd === MessageType.RegisterUser) {
            registerUser(msg, ack);
        } else if(msg.cmd === MessageType.Disconnect) {
            socket.disconnect();
        } else {
            socket.emit("gameError", "Unexpected command: " + msg.cmd);
        }
    }

    // Commands:
    //  Leave
    //   Leaves a game.
    //
    //  GetState
    //   Gets the current game state
    //   ack: game state
    //
    //  GetPresets
    //   Gets preset games for testing.
    function performInGameCommand(msg, ack) {
        if(msg.cmd === MessageType.Leave) {
            leaveCmd(ack);
        } else if(msg.cmd === MessageType.GetState) {
            requestState(ack);
        } else if(msg.cmd === MessageType.GetPresets) {
            getPresets(ack);
        } else {
            // If we didn't handle the command ourselves,
            // delegate to the game manager
            manager.performCommand(player, msg, ack);
        }
    }

    function getPresets(ack) {
        dbInterface.getPresets()
            .then(ack);
    }

    function requestState(ack) {
        ack(getGameState());
    }

    function registerUser(msg, ack) {
        // If this connection already registered a user,
        // make sure it's the same one. This can happen
        // if the connection is temporarily lost
        if(userId) {
            if(msg.userId !== userId) {
                socket.emit("gameError", "Reregistering to different user ID");
                log.warn("Reregistering to different user ID");
            } else {
                ack();
            }

            return;
        }

        // Don't let the same user log in from two different places
        if(_.includes(serverState.userIds, msg.userId)) {
            socket.emit("gameError", "User already logged in");
            return;
        }

        validateUserId(msg.userId, msg.accessToken)
            .then(registerValidated.bind(null, msg.userId, ack))
            .catch(function(error) {
                log.error(error);
                socket.emit("gameError", "Unable to validate user");
            })
            .done();
    }

    function registerValidated(id, ack) {
        userId = id;
        serverState.userIds.push(userId);

        ack();
    }

    function notifyLobbyUpdate() {
        let msg = {
            cmd: MessageType.LobbyUpdated,
            games: getGameArray()
        };

        socket.broadcast.emit("action", msg);
    }

    function gameRoom(id) {
        return "gm" + id;
    }

    function createCmd(socket, ack) {
        manager = new GameManager();
        serverState.gameManagers.set(manager.id, manager);

        // Assume we won't fail to join the game we just created
        let room = gameRoom(manager.id);
        manager.broadcast = io.to(room).emit.bind(io.to(room));
        player = manager.addPlayer(userId, generateCallbacks(room));

        socket.join(room);

        ack({
            result: ResponseCode.CreateOk,
            playerId: player.id,
            gameState: getGameState(),
            gameDescription: getLobbyDescription(manager)
        });

        notifyLobbyUpdate();
    }

    function joinCmd(msg, socket, ack) {
        let gameId = msg.id;
        manager = serverState.gameManagers.get(gameId);
        if(!manager) {
            ack({ result: ResponseCode.JoinGameNotFound });
            return;
        }

        let room = gameRoom(manager.id);
        player = manager.addPlayer(userId, generateCallbacks(room));
        if(!player) {
            manager = null;
            ack({ result: ResponseCode.JoinGameFull });
            return;
        }

        socket.join(room);
        ack({
            result: ResponseCode.JoinOk,
            playerId: player.id,
            gameState: getGameState(),
            gameDescription: getLobbyDescription(manager)
        });

        notifyPendingGameUpdated();
    }

    function getGameArray() {
        let gameArray = [];
        for(let game of serverState.gameManagers.values()) {
            gameArray.push(getLobbyDescription(game));
        }
        return gameArray;
    }

    function listCmd(ack) {
        ack(getGameArray());
    }

    function getLobbyDescription(gameManager) {
        return {
            id: gameManager.id,
            name: "ryan's game",
            users: _.map(gameManager.users, function(user) {
                return { id: user.id };
            })
        };
    }

    function leaveCmd(ack) {
        manager.removePlayer(player);
        postLeave();
        ack();
    }

    function notifyPendingGameUpdated() {
        let msg = {
            cmd: MessageType.PendingGameUpdated,
            gameDescription: getLobbyDescription(manager)
        };

        socket.broadcast.to(gameRoom(manager.id))
            .emit("action", msg);
    }

    function jsonify(player, redactDetails) {
        let result = _.cloneDeep(player);

        result.cars = _.values(result.cars);
        result.dcCards = _.values(result.dcCards);
        result.insurances = _.values(result.insurances);

        if(redactDetails) {
            delete result.money;
            delete result.blueBook;
            result.dcCards = result.dcCards.map(_.constant(null));
            result.insurances = result.insurances.map(_.constant(null));
        }

        return result;
    }

    function getGameState() {
        let users = _.reject(manager.users, { id: userId });
        users = users.map(function (user) {
            let clone = _.clone(user);
            clone.player = jsonify(clone.player, true);
            return clone;
        });

        // Add current player to front because of ugly design on the front end
        // Also don't redact details
        users.unshift({ id: 'me', player: jsonify(player) });
        return { users };
    }

    function generateCallbacks(room) {
        return {
            toYou: socket.emit.bind(socket),
            toOthers: function () {
                // it turns out that "broadcast" is simply
                // a getter that sets a property on the main
                // socket object itself which is then read when
                // emit is called. the programmers apparently
                // didn't entertain the idea that someone would want
                // to save a broadcaster for later use
                let broadcastSock = socket.broadcast.to(room);
                return broadcastSock.emit.apply(broadcastSock, arguments);
            }
        };
    }

    function disconnectPlayer() {
        serverState.userIds = _.without(serverState.userIds, userId);

        if(manager) {
            manager.removePlayer(player);
            postLeave();
        }
    }

    function postLeave() {
        notifyPendingGameUpdated(); // Technically game could be started ig.. whatever

        socket.leave(gameRoom(manager.id));

        if (manager.isEmpty())
            serverState.gameManagers.delete(manager.id);
        manager = null;

        player = null;

        notifyLobbyUpdate();
    }

    initialize();
}

module.exports = ConnectionHandler;
