import { randomUsername } from "./usernameGen.js";

export default class Connection {
    #room;

    #socket; get socket() { return this.#socket; }
    get id() { return this.#socket.id; }

    #username; get username() { return this.#username; }
    #avatar; get avatar() { return this.#avatar; }

    #writtenLie = null; get writtenLie() { return this.#writtenLie; }
    #pickedLieI = null; get pickedLieI() { return this.#pickedLieI; }
    #turnSubmitted = false; get turnSubmitted() { return this.#turnSubmitted; }

    #score = 0; get score() { return this.#score; }

    constructor(room, socket) {
        this.#room = room;
        this.#socket = socket;

        do this.#username = randomUsername();
        while (room.usernames.includes(this.#username));

        this.#avatar = 0 // Math.floor(Math.random() * 3)

        // add event listeners
        this.#handleSocket();
    }

    #handleSocket = () => {
        this.#socket.on('disconnect', reason => {
            console.info({ "USER DISCONNECTED": { id: this.id } });
            this.#room.removePlayer(this.id);
        });

        this.#socket.on('update-username', (username, callback) => {
            username = String(username).slice(0, 30);

            if (this.#room.usernames.includes(username)) return callback({ err: 'USERNAME_TAKEN' })

            this.#username = username;
            console.info({ "USER UPDATE USERNAME": { id: this.id, username: this.#username } });

            this.#room.emitPlayersList();
        });

        this.#socket.on('update-avatar', avatar => {
            if (!Number.isInteger(avatar)) return;

            this.#avatar = Math.max(0, Math.min(2, avatar));
            console.info({ "USER UPDATE AVATAR": { id: this.id, avatar: this.#avatar } });

            this.#room.emitPlayersList();
        });

        this.#socket.on('start-game', () => {
            if (this.id !== this.#room.host) return;
            this.#room.startGame();
        });

        this.#socket.on('lie-write', lie => {
            lie = String(username).slice(0, 200);

            this.#writtenLie = lie;
        });

        this.#socket.on('lie-pick', choice => {
            if (!Number.isInteger(choice)) return;

            this.#pickedLieI = Math.max(0, Math.min(2, choice));
        });

        this.#socket.on('submit-turn', () => {
            this.turnSubmitted = true;
            this.#room.goNextPhaseIfEveryoneSubmitted();
        });

        this.#socket.on('unsubmit-turn', () => {
            this.#turnSubmitted = false;
        })
    }

    newPhase(factObjs) { 
        this.#writtenLie = "";
        this.#pickedLieI = null;
        this.#turnSubmitted = false;

        this.#socket.emit('facts', { facts: factObjs.map(fact => fact.fact), phase: this.#room.phase });
    }

    awardLiePoints(survivedRounds) {
        this.#score += survivedRounds;
    }

    destroy() {
        this.#socket.removeAllListeners();
    }
}