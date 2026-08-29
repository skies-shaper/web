
export async function init_networkstuff() {

}

// Makes request to server with given room ID
// If not valid: return 0
// If server down: return 1
// If room is valid: server_join_req = 2
export async function JoinRoomResult(id) {
    return 2
}

// returns a list of the people in a room: ["username1", "username2"]
export async function GetRoomPeopleList() {

}

// submits name for consideration, returns true if it's unique, false otherwise
export async function isNameUnique() {

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

// sends player's guess as the `num`th element in the provided array (0, 1, 2)
export async function guess(num) {

}