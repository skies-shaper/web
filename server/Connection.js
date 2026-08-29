export default class Connection {
    #socket; get socket() { return this.#socket; }

    #room;

    get id() { return this.#socket.id; }
    
    constructor(room, socket) {
        this.#room = room;
        this.#socket = socket;

        // add event listeners
        this.#handleSocket();
    }

    #handleSocket = () => {
        this.#socket.on("disconnect", reason => {
            console.info({ "USER DISCONNECTED": { id: this.id } });
            this.#room.removePlayer(this.id);
        });
    }

    destroy() {
        this.#socket.removeAllListeners();
    }
}