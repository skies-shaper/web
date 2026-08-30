import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import Room from './Room.js'

class Server {
    #HOSTNAME = process.env.PORT ? "0.0.0.0" : "0.0.0.0"; get HOSTNAME() { return this.#HOSTNAME; }
    #PORT = process.env.PORT ?? 3333; get PORT() { return this.#PORT; }

    #CLIENT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "client");
    get CLIENT_PATH() { return this.#CLIENT_PATH; }

    #app;
    #server;
    #io; get io() { return this.#io; }

    #rooms = {};

    constructor() {
        this.#app = express();
        this.#server = http.createServer(this.#app);
        this.#io = new SocketIOServer(this.#server);

        this.#app.use(express.json()); // json parser middleware

        this.#app.use("/public", express.static(path.join(this.CLIENT_PATH, "public")));
        this.#app.use("/src", express.static(path.join(this.CLIENT_PATH, "src")));

        this.#app.get("/", (req, res) => res.sendFile(path.join(this.CLIENT_PATH, "index.html")));

        this.#io.on("connect", socket => {
            this.#handleSocket(socket);
        });

        this.#server.listen(this.PORT, this.HOSTNAME, () => {
            console.info({ "SERVER STARTED": { port: this.PORT, hostname: this.HOSTNAME } });
        });


        // make default room for easier testing
        this.#createRoom("Test Room", 'TEST9');
    }

    #handleSocket(socket) {
        this.#app.on("get-rooms", (callback) => {
            callback({
                rooms: Object.values(this.#rooms).map(room => ({
                    id: room.id,
                    description: room.description,
                    n_players: room.n_connections
                }))
            });
        })

        socket.on("create-room", (description, callback) => {
            callback(this.#createRoom(description ?? ""));
        })

        socket.on("join-room", (roomId, callback) => {
            roomId = roomId.toUpperCase();

            if (!Object.hasOwn(this.#rooms, roomId))
                return callback({ err: 'INVALID_CODE' });

            callback(this.#rooms[roomId].addPlayer(socket));
        });

    }

    #generateRoomId() {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        let id;

        do {
            id = "";

            for (let i = 0; i < 5; i++)
                id += alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (Object.hasOwn(this.#rooms, id));

        return id;
    }

    #createRoom(description, id) {
        id = id ?? this.#generateRoomId();
        description = description ?? "";

        const room = new Room(this, id, description)
        console.info({ "ROOM CREATED": { id, description } })

        this.#rooms[id] = room;

        return { roomId: id };
    }

    deleteRoom(id) {
        this.#rooms[id].destory();
        delete this.#rooms[id];
    }
};

const server = new Server();