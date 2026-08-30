import Connection from './Connection.js'
import { shuffle, randomLatinSquare } from './utils.js';
import facts_ from './facts.json' with { type: 'json' };
const facts = facts_.facts
export default class Room {
    static get EMPTY_CLOSE_MS() { return 30 * 1000; }
    static get PHASE_END_GRACE_PERIOD() { return 1000; }

    static get N_FACTS() { return 5; }

    #id; get id() { return this.#id; }
    #description; get description() { return this.#description; }

    #connections = {};
    get n_connections() { return Object.keys(this.#connections).length; }
    get usernames() { return Object.values(this.#connections).map(conn => conn.username); }

    #host = null; get host() { return this.#host; }
    #phase = 'lobby'; get phase() { return this.#phase; }
    #roundsLeft = null;
    #roundFactGroups = null;
    #lies = [];

    #emptyTimeout = null;
    #nextPhaseTimeout = null;

    #server;
    #socketRoom;

    constructor(server, id, description) {
        this.#id = id;
        this.#description = description;

        this.#server = server;

        this.#socketRoom = server.io.to(this.id);

        this.#startEmptyTimeout();
    }

    #startEmptyTimeout() {
        clearTimeout(this.#emptyTimeout);

        this.#emptyTimeout = setTimeout(() => {
            console.info({ "ROOM CLOSED DUE TO BEING EMPTY": { id: this.id } });
            this.#server.deleteRoom(this.id);
        }, Room.EMPTY_CLOSE_MS);
    }

    addPlayer(socket) {
        if (this.#phase !== 'lobby') return { err: 'GAME_STARTED' }
        if (this.n_connections === 10) return { err: 'ROOM_FULL' };

        console.info({ "USER JOINED ROOM": { id: socket.id, room: this.#id } });

        this.#connections[socket.id] = new Connection(this, socket);
        socket.join(this.#id);
        clearTimeout(this.#emptyTimeout);

        if (this.#host === null)
            this.#host = socket.id;

        this.emitPlayersList();

        return { username: this.#connections[socket.id].username };
    }

    removePlayer(id) {
        if (!Object.hasOwn(this.#connections, id))
            return console.error({ 'ATTEMPTED TO REMOVE NONEXISTENT CONNECTION': { id, room: this.#id } });

        this.#connections[id].socket.leave(this.#id);
        this.#connections[id].destroy();

        delete this.#connections[id];

        if (this.n_connections === 0) {
            this.#startEmptyTimeout();
            this.#host = null;
        } else {
            if (id === this.#host)
                this.#host = Object.keys(this.#connections)[0];
        }

        this.emitPlayersList();
    }

    emitPlayersList() {
        this.#socketRoom.emit('players-list', {
            players: Object.values(this.#connections).map(conn => ({
                id: conn.id,
                username: conn.username,
                isHost: conn.id === this.#host,
                avatar: conn.avatar
            }))
        });
    }

    startGame() {
        if (this.#phase !== 'lobby') return;

        this.#roundsLeft = this.n_connections - 1;
        this.#phase = 'writing';

        this.#lies = [];

        const factGroupIs = new Set();
        while (factGroupIs.size < this.n_connections)
            factGroupIs.add(Math.floor(Math.random() * facts.length));

        const factGroups = []
        for (const factGroupI of factGroupIs) factGroups.push({
            topic: facts[factGroupI].topic,
            facts: shuffle([...facts[factGroupI].facts].slice(0, Room.N_FACTS - 1))
                .map(fact => ({ fact, writerPlayer: null, reachedPlayers: [] }))
        })

        const latinSquare = randomLatinSquare(this.n_connections);
        this.#roundFactGroups = latinSquare.map(row => row.map(i => factGroups[i]));

        Object.values(this.#connections).forEach((conn, i) => conn.newPhase(this.#roundFactGroups[this.#roundsLeft][i]));
        this.#nextPhaseTimeout = setTimeout(() => { this.endPhase() }, this.getPhaseLength());
    }

    goNextPhase() {
        clearTimeout(this.#nextPhaseTimeout);

        // end phase

        Object.values(this.#connections).forEach((conn, i) => {
            const factGroup = this.#roundFactGroups[this.#roundsLeft][i].facts;

            if (this.#phase === 'writing') {
                let writtenLie = conn.writtenLie.trim();
                if (writtenLie.length === 0) writtenLie = "*empty*";

                const factObj = { fact: writtenLie, writerPlayer: conn, reachedPlayers: [] }

                const insertI = Math.floor(Math.random() * Room.N_FACTS)
                factGroup.splice(insertI, 0, factObj);

            } else if (this.#phase === 'picking') {
                for (const factObj of factGroup)
                    factObj.reachedPlayers.push(conn.id);

                let pickedLieI = conn.pickedLieI ?? Math.floor(Math.random() * Room.N_FACTS);
                pickedLieI = Math.max(0, Math.min(Room.N_FACTS, pickedLieI));

                if (factGroup[pickedLieI].writerPlayer) this.#lies.push(factGroup[pickedLieI]);
                factGroup.splice(pickedLieI, 1);

                for (const factObj of factGroup) {
                    if (!factObj.writerPlayer) continue;
                    factObj.writerPlayer.awardLiePoints(factObj.reachedPlayers.length);
                }

            } else console.error({ 'INVALID PHASE': { phase: this.#phase } });
        });

        // start new phase

        if (this.#phase === 'writing') {
            this.#phase = 'picking';
            this.#roundsLeft--;

        } else if (this.#phase === 'picking') {
            this.#phase = 'writing';

        } else console.error({ 'INVALID PHASE': { phase: this.#phase } });

        if (this.#roundsLeft <= 0 && this.#phase !== 'picking') {
            this.#roundFactGroups[0].forEach(factGroup => factGroup.facts.forEach(factObj =>
                factObj.writerPlayer && this.#lies.push(factObj)));

            const scoreObjs = Object.fromEntries(Object.values(this.#connections).map(conn =>
                [conn.id, { score: conn.score, liesReachedPlayers: [] }]));

            for (const lie of this.#lies)
                scoreObjs[lie.writerPlayer.id].liesReachedPlayers.push(lie.reachedPlayers);

            this.#socketRoom.emit('game-end', { scoreObjs });
        } else {
            Object.values(this.#connections).forEach((conn, i) =>
                conn.newPhase(this.#roundFactGroups[this.#roundsLeft][i]));

            this.#nextPhaseTimeout = setTimeout(() => { this.endPhase() }, this.getPhaseLength());
        }
    }

    goNextPhaseIfEveryoneSubmitted() {
        this.#socketRoom.emit("num-submitted-guesses", Object.values(this.#connections).filter(conn => conn.turnSubmitted).length)
        if (!Object.values(this.#connections).every(conn => conn.turnSubmitted)) return;
        this.goNextPhase();
    }

    endPhase() {
        this.#socketRoom.emit('phase-end');
        setTimeout(() => { this.goNextPhase() }, Room.PHASE_END_GRACE_PERIOD)
    }

    getPhaseLength() {
        if (this.#phase === 'writing') return 30 * 1000;
        if (this.#phase === 'picking') return 30 * 1000;
        console.error({ 'INVALID PHASE': { phase: this.#phase } });
    }

    destory() {
        clearTimeout(this.#emptyTimeout);

        for (const id of Object.keys(this.#connections))
            this.removePlayer(id);
    }
}