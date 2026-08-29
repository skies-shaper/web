
// export Connection class
module.exports = class Connection {
    #socket;
    get socket() { return this.#socket; }

    // constants
    get ID() { return this.#socket.id; }

    player = null;
    
    constructor(match, socket) {
        console.info({ "USER CONNECTED": { id: socket.id } });

        this.match = match;
        this.#socket = socket;

        // add event listeners
        this.#handleSocket();
    }

    #handleSocket = () => {
        this.#socket.on("disconnect", reason => {
            this.destroy();
        });
    }

    destroy() {
        console.info({ "USER DISCONNECTED": { id: this.ID } });
        
        if (this.player) this.killPlayer();
        delete this.match.connections[this.ID];

        this.#socket.removeAllListeners(); 
    }
}