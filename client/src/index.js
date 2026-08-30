
import * as Network from "./networking.js"
import { addButton, addTextButton, drawImage, drawText, centerText, fillRect, setFont } from "./renderfuns.js"
/*
BASE SCALE: 800x450
*/
export const gameScreenCvs = document.getElementById("gamescreen")
export const canvas = gameScreenCvs.getContext("2d")

export let buttonEvents = []
export let buttonignoresignals = {}
export let gameConsts = {
    width: 800,
    height: 450,
    scale: 1
}
export let mouseX = 400
export let mouseY = 400
const HOWLER_POS_SCALE = 0.01
var room_ID = ""
const publicPath = filename => window.location.pathname + "public/" + filename;

let res
const TPS = 30
const TIME_PER_TICK = 1000 / TPS
let ticks = 0
// // setFont("20px Lacquer")
// console.log(canvas.measureText("Cover up all of the ").width / gameConsts.scale)

function preload() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 40; j++) {
            drawImage(0, 0, 10, 10, `avatar/${i}/frame_${String(j).padStart(2, "0")}_delay-0.1s.png`)
        }
    }


}

preload()
setInterval(() => {
    try { _gameLoop() } catch (e) { }
}, (1000 / 60))

gameScreenCvs.addEventListener("mousemove", (event) => {
    mouseX = event.offsetX / gameConsts.scale * window.devicePixelRatio
    mouseY = event.offsetY / gameConsts.scale * window.devicePixelRatio
})

var game_states = {
    0: mainmenu, //
    1: joinscreen,
    2: hostscreen,
    3: findscreen,
    4: loadingscreen, // screen for loading; create a POST_LOAD variable and a LOAD_TEXT variable to store what it says and what happens next
    5: aboutscreen, // screen that shows the about stuff
    6: lyingscreen,
    7: guessscreen,
    8: scorescreen,
}
var game_state = 0
console.log(game_state)

function _gameLoop() {
    canvas.imageSmoothingEnabled = false
    num_avatars_drawn = 0
    canvas.fillStyle = "black"
    fillRect(0, 0, 1000, 1000)

    handleTextInput()
    game_states[game_state]()
    ticks++
    // console.log(mouseX + "::" + mouseY)
}
var isJoinBtnClicked = false
var textinput_str = ""
var curr_textinput = 0

var server_join_res = null;

async function handleHashChange() {
    if (window.location.hash.length != 6) return; // hashtag + 5 char room id 

    room_ID = window.location.hash.substring(1).toUpperCase();
    console.log(room_ID);

    server_join_res = await Network.JoinRoomResult(room_ID)
}

window.addEventListener("hashchange", e => handleHashChange());
handleHashChange();
var errormsg = ""

function mainmenu() {
    canvas.fillStyle = "white"
    setFont("60px")
    centerText("Web", 50)
    centerText("Of", 100)
    centerText("Lies", 150)
    drawImage(0, 0, 80, 80, "spiderweb-left.png")
    drawImage(800 - 80, 0, 80, 80, "spiderweb-right.png")

    setFont("30px")

    canvas.fillStyle = "red"
    centerText(errormsg, 250)
    canvas.fillStyle = "white"

    // 355,270 > 450,300
    if (server_join_res !== null) {

        console.log(server_join_res)

        if (server_join_res.err) {
            errormsg = {
                'INVALID_CODE': "Invalid join code",
                'TIMED_OUT': "Could not reach server",
                "ROOM_FULL": "Requested room is full",
                "GAME_STARTED": "Game already started",
            }[server_join_res.err]

        } else {
            game_state = 1
            // room_ID = server_join_res.room_ID

        }
    }
    if (!isJoinBtnClicked) {
        addTextButton("Join", -100, 290, () => {
            isJoinBtnClicked = !isJoinBtnClicked
            typed = []
        })
    } else {
        addTextButton("Join", 270, 290, () => {
            isJoinBtnClicked = !isJoinBtnClicked
            typed = []
        })
        drawText(textinput_str, 350, 290)
        if (typed.length < 5) {
            canvas.fillStyle = "grey"
            drawText("· Go! ·", 475, 290)
        }
        else {
            addTextButton("Go!", 475, 290, async () => {
                window.location.hash = typed.join("");
            })
        }

        canvas.fillStyle = "white"
    }
    // centerText("· Join ·", 290)
    // 355, 300 > 450, 330
    // addTextButton("Find", -100, 320, () => {
    //     console.log("Going to Find Server Screen")
    //     game_state = 3
    // })
    canvas.fillStyle = "grey"
    centerText("· Find ·", 320)
    canvas.fillStyle = "white"

    // 355, 330 > 450, 360
    addTextButton("Host", -100, 350, async () => {
        console.log("Going to Host Server Screen")
        game_state = 2

        res = await Network.create_room()

        if (res.err) { }
        room_ID = res.roomId.toUpperCase();

        // join room
        window.location.hash = room_ID;
    })
    addTextButton("About", -100, 415, async () => {
        console.log("Going to About Screen")
        game_state = 5
    })
}

var editing_name = false;
var name = "player123456890"
var prevname = ""
let avatars = [

]
let player_avatar = 0
let players_list = [{ name: "a", avatar: 0 }, { name: "b", avatar: 0 }, { name: "c", avatar: 0 }, { name: "d", avatar: 0 }, { name: "e", avatar: 0 }, { name: "f", avatar: 0 }]
Network.socket.on('players-list', ({ players }) => {
    console.log("received updated playerlist")
    players_list = players
    let player_obj = players.find((a) => a.id == Network.socket.id)
    name = player_obj.username
    is_host = player_obj.isHost
    console.log(player_obj)
});

async function joinscreen() {

    var js_leftmargin = 25
    // console.log(players_list)
    canvas.fillStyle = "white"
    // ability to set name (textbox)
    // list of currently joined players (and if they're the host)
    // note list of returned players must always have the host at index 0.
    setFont("40px")
    drawText(players_list.find((a) => a.isHost).username + "'s Room -- code " + room_ID.toUpperCase(), js_leftmargin, 40)
    setFont("20px")
    drawText(players_list.length + "/ 10 players", js_leftmargin, 60)

    setFont("30px")
    for (let i = 0; i < players_list.length; i++) {
        draw_profilePic(js_leftmargin - 10, 65 + (i * 34), 30, players_list[i].avatar)
        drawText(players_list[i].username + ((players_list[i].isHost) ? " (Host)" : ""), js_leftmargin + 30, 90 + (i * 34))
    }

    fillRect(399, 50, 2, 385)
    // customization things

    if (!editing_name)
        drawText(name, 430, 90)
    else
        drawText(textinput_str, 430, 90)
    addTextButton((editing_name ? "Submit" : "Edit"), ((editing_name) ? (canvas.measureText(textinput_str).width / gameConsts.scale) + 430 + 20 : (canvas.measureText(name).width / gameConsts.scale) + 430 + 20), 90, () => {
        console.log("click")
        if (!editing_name) {
            typed = []
            prevname = name
            curr_textinput = 1
            editing_name = true
            return
        }
        if (editing_name) {
            if (name == "") {
                name = prevname
                console.log("bad name change")
            } else {
                name = textinput_str
                Network.set_name(name)
                console.log("network-setname!")
            }
            editing_name = false
            return
        }
    }, "SUBMIT-BTN")

    // draw avatar images in a like circle frame etc up here once complete. probably store all in a specific folder that is auto-filled 
    draw_profilePic(600 - 50 - 80, 200 - 30, 60, (player_avatar - 1 + max_num_avatars) % max_num_avatars)
    draw_profilePic(600 - 50, 200 - 50, 100, player_avatar)
    draw_profilePic(600 + 50 + 20, 200 - 30, 60, (player_avatar + 1) % max_num_avatars)
    canvas.filter = "opacity(50%)"
    canvas.fillStyle = "black"
    fillRect(600 - 50 - 80, 200 - 30, 60, 60)
    fillRect(600 + 50 + 20, 200 - 30, 60, 60)
    canvas.fillStyle = "white"

    canvas.filter = "none"
    let tText = "Avatar: " + avatar_bases[Math.floor(player_avatar / avatar_hats.length)] + " with " + avatar_hats[Math.floor(player_avatar % avatar_hats.length)]
    setFont("15px")
    drawText(tText, 600 - (canvas.measureText(tText).width / gameConsts.scale / 2), 300)
    setFont("25px")

    addTextButton("prev", 430, 325, () => {
        // increment player's stored avatar ID by 1 % max_num_avatars
        player_avatar++
        player_avatar %= max_num_avatars
        Network.set_server_avatarID(player_avatar)
    })
    addTextButton("next", 700, 325, () => {
        player_avatar--
        player_avatar += max_num_avatars
        player_avatar %= max_num_avatars
        Network.set_server_avatarID(player_avatar)
        // decrement player's stored avatar ID by 1 % max_num_avatars
    })

    // name editor
    // name starts out "player+socket id"
    //  -> on submit, send to server name
    // avatar editor
    // increment avatar ID + 1 mod total number avatar IDs

    // if host, a "begin game" button
    setFont("40px")
    if (is_host) {
        if (players_list.length > 1) {
            addTextButton("Begin Game", js_leftmargin, 435, () => {
                Network.beginGame()
                loadingscreenSubText = "Joining Game"
                game_state = 4
            })
        } else {
            canvas.fillStyle = "grey"
            drawText("· Begin Game ·", js_leftmargin, 435)
        }

    }
}


var is_host = false
function hostscreen() {
    canvas.fillStyle = "white"
    setFont("20px")
    centerText("Hosting Room", 30)
    setFont("100px")
    if (typeof room_ID != "string") {
        centerText("- - - - -", 110)
    } else {
        centerText(room_ID.toUpperCase(), 110)
    }

    setFont("60px")
    addTextButton("Begin game", -100, 300, () => {
        game_state = 1
        is_host = true
    })
}
var loadingscreen_next = 0
let loadingscreenMainText = "Loading"
let loadingscreenSubText = ""
function loadingscreen() {
    canvas.fillStyle = "white"
    setFont("90px")
    centerText(loadingscreenMainText.padEnd(loadingscreenMainText.length + (Math.floor(ticks / 30) % 4), "."), 225)
    setFont("40px")
    centerText(loadingscreenSubText, 260)
}

function aboutscreen() {
    canvas.fillStyle = "white"
    setFont("50px")
    centerText("Web of Lies", 40)
    setFont("30px")
    centerText("Programming and Layout - SkiesShaper", 70)
    centerText("Backend - Me123jm", 100)
    centerText("Writing - Landalt", 130)
    centerText("Art - MarieMelody", 160)

    addTextButton("Back", -100, 415, async () => {
        console.log("Going to main menu")
        game_state = 0
    })

}
var topicdata = { topic: "cheese", factList: ["mmm tasty", "contains salt sometimes"] } // WILL BE POPULATED before lyingscreen is called
var numsubmittedresponses = 0

//  3 bases and X hats
//  avatarID 1 -> 1 / (NUM_HATS) = 0 -> base 0, hat 1
//  avatarID (NUM_HATS) + 1 / NUM_HATS = 1 > base 1, hat 1
let round_prog_timer = {}
let round_prog_timer_secs = 0
Network.socket.on("facts", ({ facts, phase, topic }) => {
    console.log(facts)
    console.log(topic)
    console.log(phase)

    topicdata.factList = facts
    topicdata.topic = topic
    clearInterval(round_prog_timer)
    if (phase == "writing") {
        game_state = 6
        typed = []
        numsubmittedresponses = 0
        round_prog_timer_secs = 30
        round_prog_timer = setInterval(() => { round_prog_timer_secs -= 1 }, 1000)
    }
    if (phase == "picking") {
        guess_options = facts
        typed = []
        game_state = 7
        numsubmittedresponses = 0
        round_prog_timer_secs = 30
        round_prog_timer = setInterval(() => { round_prog_timer_secs -= 1 }, 1000)
    }

})
Network.socket.on("num-submitted-guesses", (num) => {
    numsubmittedresponses = num
})

function lyingscreen() {

    curr_textinput = 2
    canvas.fillStyle = "white"
    drawImage(800 - 80, 0, 80, 80, "spiderweb-right.png")
    setFont("70px")
    drawText("Your topic is " + topicdata.topic + ".", 25, 65)

    setFont("40px")
    drawText("Here are some true facts:", 25, 100)
    setFont("20px")
    for (let i = 0; i < topicdata.factList.length; i++) {
        drawText("· " + topicdata.factList[i], 25, 120 + i * 20)
    }
    setFont("30px")
    centerText("Now write a magnificent mendacity about " + topicdata.topic + "!", 200)
    setFont("20px")
    drawText(textinput_str, 25, 230)

    addTextButton("submit", 25, 300, () => {
        console.log("submit lie!!!")
        Network.submit_lie(textinput_str)
    })
    drawText(numsubmittedresponses + "/" + players_list.length + " responses received, " + round_prog_timer_secs + " seconds remain.", 100, 300)
}
var guess_options = ["cheese is awesome", "cheese is cool", "cheese tastes good", "cheesesesesese", "OBVIOUSLY UNTRUE"] // to be filled in the loading screen!
var guess_choice = 0
var time_remaining = 30
function guessscreen() {
    canvas.fillStyle = "white"
    canvas.fillStyle = "white"
    drawImage(800 - 80, 0, 80, 80, "spiderweb-right.png")
    setFont("70px")
    drawText("Your topic is " + topicdata.topic + ".", 25, 65)

    setFont("40px")
    drawText("Before you are some true facts.", 25, 100)
    drawText("But one is not. Choose the Lie.", 25, 130)
    setFont("20px")
    for (let i = 0; i < guess_options.length; i++) {
        addTextButton("The Lie", 25, 155 + i * 20, () => {
            guess_choice = i
            console.log(i)
            Network.guess(i)
        })
        drawText("· " + guess_options[i], 100, 155 + i * 20)
    }


    drawText("Your choice:", 25, 300)
    drawText("\"" + guess_options[guess_choice] + "\" is the lie", 25, 320)
    drawText(numsubmittedresponses + "/" + players_list.length + " responses received. " + round_prog_timer_secs + " seconds left", 25, 350)
}

function findscreen() { }

// scoreobj can be sent with player scores in any order. will be sorted into sorted_playerlist.
let scoreobj = [
    { name: "Gallant Gecko", profile: 0, connections: [[0, 1], [0, 4, 2]], score: 1 + 1 + 2 },
    { name: "Ornery Octopus", profile: 2, connections: [], score: 0 },
    // { name: "Evil Edamame", profile: 1, connections: [[2, 0], [2, 3]], score: 1 + 1 },
    // { name: "Adventurous Apple", profile: 2, connections: [[3, 1]], score: 1 },
    // { name: "Cheerful Cheetah", profile: 3, connections: [[4, 0, 2, 3, 1]], score: 1 + 2 + 3 + 4 },
    // { name: "test test", profile: 3, connections: [[4, 0, 2, 3, 1]], score: 2 },
    // { name: "test test", profile: 3, connections: [[4, 0, 2, 3, 1]], score: 2 },
    // { name: "test test", profile: 3, connections: [[4, 0, 2, 3, 1]], score: 2 },
    // { name: "test test", profile: 3, connections: [[4, 0, 2, 3, 1]], score: 2 },
    // { name: "test test", profile: 3, connections: [[4, 0, 2, 3, 1]], score: 2 },
]

Network.socket.on("game-end", ({ scoreObjs }) => {
    console.log(scoreObjs)

    scoreobj = Object.entries(scoreObjs).map(([id, obj]) => {
        const player = players_list.find(p => p.id == id);

        return {
            score: obj.score,
            name: player.username,
            profile: player.avatar,

            connections: obj.liesReachedPlayers
                .map(lie => [id, ...lie])
                .map(lie => lie.map(playerId => players_list.findIndex(p => p.id == playerId))),
        }
    })

    console.log(scoreobj);
    sorted_playerlist = scoreobj.sort((a, b) => b.score - a.score)
    game_state = 8
})

var sorted_playerlist = scoreobj.sort((a, b) => b.score - a.score)
console.log(sorted_playerlist)
var anglemod = 0
var angleacc = 0.1
var web_ticks = 0
var alphamod = 0
/*{
  "LSnoC6FIUrOMrhnsAAAH": {
    "score": 0,
    "liesReachedPlayers": [
      [
        "RpluDmX8Adz4C6m5AAAF"
      ]
    ]
  },
  "RpluDmX8Adz4C6m5AAAF": {
    "score": 0,
    "liesReachedPlayers": [
      [
        "LSnoC6FIUrOMrhnsAAAH"
      ]
    ]
  }
}*/
function scorescreen() {
    var len = sorted_playerlist.length
    var f_base = (Math.PI / (len / 2))
    anglemod += angleacc
    angleacc -= 0.002
    angleacc = Math.max(angleacc, 0)
    if (anglemod > 2 * Math.PI) {
        anglemod = 2 * Math.PI
    }
    alphamod++
    let prof_pic_size = 60 - (len * 3)
    for (let i = 0; i < len; i++) {
        draw_profilePic(200 + (100 * Math.cos(f_base * i + anglemod)), 200 + (100 * Math.sin(f_base * i + anglemod)), prof_pic_size, sorted_playerlist[i].profile)
        canvas.fillStyle = "black"


        canvas.strokeStyle = "white"
        canvas.lineWidth = 2 * gameConsts.scale
        canvas.beginPath()
        canvas.ellipse((200 + prof_pic_size / 2 + (100 * Math.cos(f_base * i + anglemod))) * gameConsts.scale, (200 + prof_pic_size / 2 + (100 * Math.sin(f_base * i + anglemod))) * gameConsts.scale, (prof_pic_size / 2 + 3) * gameConsts.scale, (prof_pic_size / 2 + 3) * gameConsts.scale, Math.PI, 0, Math.PI * 2)

        canvas.closePath()
        canvas.stroke()
        canvas.filter = `opacity(${100 - Math.min(100, alphamod + ((len - i) / len) * 50)}%)`
        canvas.fill()


        canvas.filter = "none"
    }
    canvas.filter = `opacity(${Math.min(100, alphamod)}%)`
    canvas.fillStyle = "white"
    fillRect(399, 50, 2, 385)
    setFont("60px")
    drawText("Scoring", 25, 50)
    setFont("30px")
    drawText(name, 800 - (canvas.measureText(name).width / gameConsts.scale) - 10, 35)
    draw_profilePic(800 - (canvas.measureText(name).width / gameConsts.scale) - 50, 10, 30, player_avatar)

    setFont((prof_pic_size / 2) + "px")
    for (let i = 0; i < len; i++) {

        draw_profilePic(420, Math.max((prof_pic_size * 4 / 3), (prof_pic_size * 4 / 3) + (-0.5 * alphamod)) + (prof_pic_size + 5) * i + (5 * Math.pow(i, 2 - Math.min(1, alphamod / 50))), prof_pic_size, sorted_playerlist[i].profile)

        drawText(`${sorted_playerlist[i].name} · ${sorted_playerlist[i].score}`, 420 + (1.2 * prof_pic_size), Math.max((prof_pic_size * 2), (prof_pic_size / 3) + 60 + (-0.5 * alphamod)) + (prof_pic_size + 5) * i + (5 * Math.pow(i, 2 - Math.min(1, alphamod / 50))))
    }

    canvas.filter = "none"

    if (alphamod > 80) {
        web_ticks++
        let pos_from_idx = (i) => {
            return [((200 + prof_pic_size / 2) + ((97 - (prof_pic_size / 2)) * Math.cos(f_base * i + anglemod))) * gameConsts.scale, ((200 + prof_pic_size / 2) + ((97 - (prof_pic_size / 2)) * Math.sin(f_base * i + anglemod))) * gameConsts.scale]
        }
        let num_drawn_strokes = 0
        for (let i = 0; i < len; i++) {
            let c = sorted_playerlist[i].connections
            for (let j = 0; j < c.length; j++) {
                for (let h = 0; h < c[j].length - 1; h++) {
                    canvas.lineWidth = (2 + Math.sin(num_drawn_strokes)) * gameConsts.scale
                    canvas.strokeStyle = `hsl(0, 0%, ${(Math.sin(num_drawn_strokes) * 20) + 80}%)`

                    canvas.beginPath()
                    canvas.moveTo(pos_from_idx(c[j][h])[0], pos_from_idx(c[j][h])[1])
                    canvas.lineTo(pos_from_idx(c[j][h + 1])[0], pos_from_idx(c[j][h + 1])[1])

                    if (num_drawn_strokes < (web_ticks / 10)) {

                        canvas.stroke()
                    } else {
                        canvas.closePath()
                    }
                    num_drawn_strokes++
                }
            }
        }

    }
    for (let i = 0; i < len; i++) {

        canvas.strokeStyle = "white"
        canvas.lineWidth = 2 * gameConsts.scale
        canvas.beginPath()
        canvas.ellipse((200 + prof_pic_size / 2 + (100 * Math.cos(f_base * i + anglemod))) * gameConsts.scale, (200 + prof_pic_size / 2 + (100 * Math.sin(f_base * i + anglemod))) * gameConsts.scale, (prof_pic_size / 2 + 3) * gameConsts.scale, (prof_pic_size / 2 + 3) * gameConsts.scale, Math.PI, 0, Math.PI * 2)

        canvas.closePath()
        canvas.stroke()
    }
    // animate the web of ppl's avatars going in a circle
    // animate webbing going back and forth around circle
    // animate up the score list
}

let avatar_bases = [
    "bald-person",
    "ribbon-person",
    "moustache-person"
]
let avatar_hats = [
    "no hat",
    "cowboy cat",
    "top hat",
    "bowler hat",
    "dunce cap",
    "University of Illinois block I logo (R)",
    "Gamebuilders hat"
]
let max_num_avatars = avatar_bases.length * avatar_hats.length;
let num_avatars_drawn = 0
function draw_profilePic(x, y, size, id) {

    let avatar_base_num = Math.floor(id / avatar_hats.length)
    let avatar_hat_num = Math.floor(id % avatar_hats.length)

    canvas.save()
    canvas.beginPath()
    canvas.ellipse((x + (size / 2)) * gameConsts.scale, (y + (size / 2)) * gameConsts.scale, (size / 2) * gameConsts.scale, (size / 2) * gameConsts.scale, Math.PI, 0, Math.PI * 2)

    canvas.closePath()
    canvas.clip("nonzero")
    drawImage(x, y, size, size, `curtains.png`)

    drawImage(x, y + (size / 16 * 3), size, size, `avatar/${avatar_base_num}/frame_${String(Math.floor((ticks / 6) + Math.abs(100 * Math.sin(num_avatars_drawn * 3))) % 40).padStart(2, "0")}_delay-0.1s.png`)
    drawImage(x + (size / 4), y + (size / 8), size / 2, size / 2, `avatar-hat/${avatar_hat_num}.png`)
    canvas.closePath()
    canvas.restore()
    num_avatars_drawn++
}
var typed = []
window.addEventListener("keydown", (e) => {
    if (curr_textinput == 0 && e.key.match(/((backspace)|[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789])/))
        typed.push(e.key)
    if ((curr_textinput == 1) && e.key.match(/((backspace)|[A-Za-z0-9 ])/)) {
        if (e.shiftKey)
            typed.push(e.key.toUpperCase())
        else
            typed.push(e.key)
    }
    if ((curr_textinput == 2) && e.key.match(/((backspace)|[A-Za-z0-9\.'"!, ])/)) {
        typed.push(e.key)
    }
})
// textareas: 
// -- lying type in
// -- enter join code
// -- writing name



async function handleTextInput() {
    if (isJoinBtnClicked && game_state == 0) {

        curr_textinput = 0
        if (typed[typed.length - 1] == "Backspace") {
            typed.pop()
            typed.pop()
        }

        if ((typed.length > 0) && (typed.length > 5 || typed[typed.length - 1].length > 1)) {
            typed.pop()
        }
        // console.log(typed)
        textinput_str = typed.join(" ").padEnd(10, " _").toUpperCase()
    }
    if (editing_name && game_state == 1) {
        curr_textinput = 1
        if (typed[typed.length - 1] == "Backspace") {
            typed.pop()
            typed.pop()
        }
        if ((canvas.measureText(typed.join("")).width / gameConsts.scale) > 300 || (typed.length > 0 && typed[typed.length - 1].length > 1)) {
            typed.pop()
        }
        // console.log(typed)
        textinput_str = typed.join("")
    }
    if (game_state == 6) {
        if (typed[typed.length - 1] == "Backspace") {
            typed.pop()
            typed.pop()
        }
        if ((canvas.measureText(typed.join("")).width / gameConsts.scale) > 700 || (typed.length > 0 && typed[typed.length - 1].length > 1)) {
            typed.pop()
        }
        textinput_str = typed.join("") + ((Math.floor(ticks / 30) % 2 == 0) ? "_" : "")
        Network.give_lie_text(typed.join(""))
    }
}

sizeCvs()
window.addEventListener('resize', sizeCvs)

function sizeCvs() {
    if (window.innerWidth < (window.innerHeight / 450) * 800) {
        gameConsts.width = window.innerWidth
        gameConsts.height = (window.innerWidth / 800) * 450
        gameConsts.scale = window.innerWidth / 800 * window.devicePixelRatio
        gameScreenCvs.height = gameConsts.height * window.devicePixelRatio
        gameScreenCvs.width = gameConsts.width * window.devicePixelRatio
        gameScreenCvs.style.height = gameConsts.height + "px"
        gameScreenCvs.style.width = gameConsts.width + "px"
    }
    else {
        gameConsts.width = (window.innerHeight / 450) * 800
        gameConsts.height = window.innerHeight
        gameConsts.scale = window.innerHeight / 450 * window.devicePixelRatio
        gameScreenCvs.height = gameConsts.height * window.devicePixelRatio
        gameScreenCvs.width = gameConsts.width * window.devicePixelRatio
        gameScreenCvs.style.height = gameConsts.height + "px"
        gameScreenCvs.style.width = gameConsts.width + "px"
    }
}