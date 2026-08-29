

export default class Connection {
    #room;

    #socket; get socket() { return this.#socket; }
    get id() { return this.#socket.id; }

    #username; get username() { return this.#username; }
    #avatar; get avatar() { return this.#avatar; }
    
    constructor(room, socket) {
        this.#room = room;
        this.#socket = socket;

        this.#username = room.generateUsername();
        this.#avatar = 0 // Math.floor(Math.random() * 10)

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