const path = require("path");

const Connection = require("./Connection.js");

module.exports = class Match {
    static ID = 0;

    CLIENT_PATH = path.join(__dirname, "..", "client"); 

    connections = {};

    constructor(server, description, time) {
        this.ID = Match.ID.toString();
        Match.ID++;

        this.description = description;
        this.time = time;

        this.server = server;

        this.namespace = server.io.of("/match/" + this.ID)

        this.namespace.on("connect",socket => {
            this.connections[socket.id] = new Connection(this, socket);
        });

        this.createEmptyTimeout();
    }

    createEmptyTimeout() {
        this.emptyTimeout = setTimeout(() => {
            if (this.connections.length == 0) {
                this.server.deleteMatch(this.ID);
            }
        }, 30000)
    }
}