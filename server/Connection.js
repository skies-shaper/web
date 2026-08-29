export default class Connection {
    #socket; get socket() { return this.#socket; }

    #room;

    get id() { return this.#socket.id; }
    
    constructor(room, socket) {
        console.info({ "USER JOINED ROOM": { id: socket.id, room: room.id } });

        this.#room = room;
        this.#socket = socket;

        // add event listeners
        this.#handleSocket();
    }

    #handleSocket = () => {
        this.#socket.on("disconnect", reason => {
            console.info({ "USER LEFT ROOM": { id: this.id } });
            this.destroy()
        });
    }

    destroy() {
        this.#socket.removeAllListeners();
        this.#room.removePlayer(this.id);
    }
}