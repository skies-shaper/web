import Connection from './Connection.js'

export default class Room {
    static EMPTY_CLOSE_MS = 30*1000;

    #id; get id() { return this.#id; }
    #description; get description() { return this.#description; }

    #connections = {};
    get n_connections() { return this.#connections.length; }

    #server;
    #socketRoom;
    #emptyTimeout;

    constructor(server, id, description) {
        this.#id = id;
        this.#description = description;

        this.#server = server;

        this.#socketRoom = server.io.to(this.id)

        this.#createEmptyTimeout();
    }

    #createEmptyTimeout() {
        clearTimeout(this.#emptyTimeout);

        this.#emptyTimeout = setTimeout(() => {
            console.info({ "ROOM CLOSED DUE TO BEING EMPTY": { id: this.id } });
            this.destory();
        }, Room.EMPTY_CLOSE_MS);
    }

    addPlayer(socket) {
        this.#connections[socket.id] = new Connection(this, socket);

        clearTimeout(this.#emptyTimeout);
    }

    removePlayer(id) {
        delete this.#connections[id];

        if (this.#connections.length == 0)
            this.#createEmptyTimeout();
    }

    destory() {
        clearTimeout(this.#emptyTimeout);

        this.#socketRoom.removeAllListeners();
        this.#server.deleteRoom(this.id);
    }
}