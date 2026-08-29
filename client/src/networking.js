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

export async function init_networkstuff() {

}

export async function set_server_avatarID(id) { }

//returns true if is host, false otherwise (do JS modules respect inheritance hierarchies??? maybe idk anyways this function is here also)
export function isHost() {
    return true
}
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

// returns a list of the people in a room: [{"name": "oogabooga", avatar: 0}, ...]. The room's host should be at index 0 and the rest should be in order of joining (i.e. if player3 leaves, then player4 and player5 would take indices 2 and 3 from 3 and 4)
export async function GetRoomPeopleList() {

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

// returns a list of 2 facts from the player's assigned slot in the fact list ["Alex is cool", "Cheese is tasty"]
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