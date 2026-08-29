import Connection from './Connection.js'

export default class Room {
    static EMPTY_CLOSE_MS = 30*1000;

    #id; get id() { return this.#id; }
    #description; get description() { return this.#description; }

    #connections = {};
    get n_connections() { return Object.keys(this.#connections).length; }

    #server;
    #socketRoom;
    #emptyTimeout;

    constructor(server, id, description) {
        this.#id = id;
        this.#description = description;

        this.#server = server;

        this.#socketRoom = server.io.to(this.id);

        this.#createEmptyTimeout();
    }

    #createEmptyTimeout() {
        clearTimeout(this.#emptyTimeout);

        this.#emptyTimeout = setTimeout(() => {
            console.info({ "ROOM CLOSED DUE TO BEING EMPTY": { id: this.id } });
            this.#server.deleteRoom(this.id);
        }, Room.EMPTY_CLOSE_MS);
    }

    addPlayer(socket) {
        if (this.n_connections === 10) return { err: 'ROOM_FULL' } ;

        console.info({ "USER JOINED ROOM": { id: socket.id, room: this.#id } });

        this.#connections[socket.id] = new Connection(this, socket);
        socket.join(this.#id);
        clearTimeout(this.#emptyTimeout);

        return {};
    }

    removePlayer(id) {
        if (!this.#connections.hasOwn(id))
            return console.error({ 'ATTEMPTED TO REMOVE NONEXISTENT CONNECTION': { id, room: this.#id } });

        this.#connections[id].socket.leave(this.#id);
        this.#connections[id].destroy();

        delete this.#connections[id];

        if (this.n_connections === 0)
            this.#createEmptyTimeout();
    }

    destory() {
        clearTimeout(this.#emptyTimeout);

        for (const id of Object.keys(this.#connections))
            this.removePlayer(id);
    }
}