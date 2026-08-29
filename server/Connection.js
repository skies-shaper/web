

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
        this.#avatar = 0 // Math.floor(Math.random() * 3)

        // add event listeners
        this.#handleSocket();
    }

    #handleSocket = () => {
        this.#socket.on("disconnect", reason => {
            console.info({ "USER DISCONNECTED": { id: this.id } });
            this.#room.removePlayer(this.id);
        });

        this.#socket.on("update-player-info", info => {
            console.info({ "USER UPDATE INFO": { id: this.id, info } });
            
            const newUsername = info.username ?? this.#username;
            this.#username = String(newUsername).slice(0, 30);

            const newAvatar = info.avatar ?? this.#avatar;
            if (Number.isInteger(newAvatar))
                this.#avatar = Math.max(0, Math.min(2, newAvatar));

            this.#room.emitPlayersList();
        });
    }

    destroy() {
        this.#socket.removeAllListeners();
    }
}