"use strict";

const config            = require("config").get("dc-server"),
      IoServer          = require("socket.io"),
      emitter           = require("component-emitter"),
      log               = require("rpb-logging")("dc-server"),
      ConnectionHandler = require("./connection-handler");

function Server() {
    let self = this;
    let io;
    let serverState = {
        gameManagers: new Map(),
        userIds: [],
        playerToGame: new Map()
    };

    emitter(this);

    function initialize() {
        if(!config.port) {
            log.error("Port must be specified in DC_PORT environment variable.");
            return;
        }

        io = IoServer.listen(config.port);

        io.on("connection", function(socket) {
            new ConnectionHandler(io, socket, serverState);
        });

        io.httpServer.on("listening", function() {
            log.info("listening on *:" + config.port);
            self.emit("listening");
        });

        io.httpServer.on("close", function () {
            log.info("closed connection");
            self.emit("close");
        });
    }

    function destroy() {
        io.close();
    }
    this.destroy = destroy;

    initialize();
}

module.exports = Server;