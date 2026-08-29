export const socket = io();
export const TIMEOUT_MS = 5000;

export async function emitWithTimeoutAck(...args) {
    let res;
    try {
        res = await socket.timeout(TIMEOUT_MS).emitWithAck(...args);
    } catch (err) {
        res = { err: "TIMED_OUT" }
    }

    return res;
}


export async function set_server_avatarID(id) { }


// creates room. Returns room ID for display purposes
export async function create_room(description) {
    return emitWithTimeoutAck('create-room', description);
}
// Makes request to server with given room ID
// If not valid: return 0
// If server down: return 1
// If room is valid: server_join_req = 2
export async function JoinRoomResult(id) {
    return emitWithTimeoutAck('join-room', id);
}


// submits name for consideration, returns true if it's unique, false otherwise
export async function isNameUnique(name) {
    return true
}
export async function set_name() { // we let multiple people have the same name. chaos ensues.

}

// returns list of objects with {"id" : "ABCDE", "players": 0}
export async function public_rooms() { }

//available to hosts, starts game for all players in a room
export async function start_game() {

}

// returns an object containing:
// {topic: "topic-name", factList: [...]}
//  factList:  of 2 facts from the player's assigned slot in the fact list ["Alex is cool", "Cheese is tasty"]

export async function get_list_of_facts() {

}

//submits a lie text for the player's grouping of facts
export async function submit_lie(text) {

}


// returns all of the things the player is able to guess (three things: 2 facts and one lie)
export async function get_round_guess_options() {

}

// sends player's guess as num (the `num`th element in the provided array (0, 1, 2))
export async function guess(num) {

}

// starts the game in the host's room
export async function beginGame() {

}