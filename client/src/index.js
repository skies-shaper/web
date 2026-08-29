
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

const publicPath = filename => window.location.pathname + "public/" + filename;


const TPS = 30
const TIME_PER_TICK = 1000 / TPS
const MAX_TIME_BT_TICKS = TIME_PER_TICK * 2 - 3;

let time = 0;
let _stopGameLoop = false;
let _realTPSCounter = 0;
let realTPS = 0;
let totalTicks = 0;
let animationTicks = 0
// // setFont("20px Lacquer")
// console.log(canvas.measureText("Cover up all of the ").width / gameConsts.scale)


setInterval(() => {
    _gameLoop()

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
}
var game_state = 0

function _gameLoop() {
    canvas.fillStyle = "black"
    fillRect(0, 0, 1000, 1000)

    handleTextInput()
    game_states[game_state]()
    // console.log(mouseX + "::" + mouseY)
}
var isJoinBtnClicked = false
var textinput_str = ""
var curr_textinput = 0

var server_join_res = null;

async function handleHashChange() {
    if (window.location.hash.length != 6) return; // hashtag + 5 char room id 

    const roomId = window.location.hash.substring(1);
    console.log(roomId);
    server_join_res = await Network.JoinRoomResult(roomId)
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
                'TIMED_OUT': "Could not reach server"
            }[server_join_res.err]
        } else {
            game_state = 1
            // room_ID = server_join_res.room_ID
            room_ID = "ABCDE"
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
        room_ID = res.roomId;

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
    { "name": "bob", "src": "" },
    { "name": "jooooooooooooooooe", "src": "" }
]
let player_avatar = 0
let players_list = [{ name: "a", avatar: 0 }, { name: "b", avatar: 0 }, { name: "c", avatar: 0 }, { name: "d", avatar: 0 }, { name: "e", avatar: 0 }, { name: "f", avatar: 0 }]
async function joinscreen() {

    var js_leftmargin = 25
    if (/*it's been like .5 seconds*/false)
        players_list = Network.GetRoomPeopleList()

    canvas.fillStyle = "white"
    // ability to set name (textbox)
    // list of currently joined players (and if they're the host)
    // note list of returned players must always have the host at index 0.
    setFont("40px")
    drawText(players_list[0].name + "'s Room -- code " + room_ID, js_leftmargin, 40)
    setFont("20px")
    drawText(players_list.length + "/ 10 players", js_leftmargin, 60)

    setFont("30px")
    for (let i = 0; i < players_list.length; i++) {
        drawText(players_list[i].name + ((i == 0) ? " (Host)" : ""), js_leftmargin + 30, 90 + (i * 34))
    }

    fillRect(399, 50, 2, 385)
    // customization things

    if (!editing_name)
        drawText(name, 430, 90)
    else
        drawText(textinput_str, 430, 90)
    addTextButton((editing_name ? "Submit" : "Edit"), ((editing_name) ? (canvas.measureText(textinput_str).width / gameConsts.scale) + 430 + 20 : (canvas.measureText(name).width / gameConsts.scale) + 430 + 20), 90, async () => {
        if (!editing_name) {
            typed = []
            prevname = name
            curr_textinput = 1
        }
        if (editing_name) {
            if (name == "") {
                name = prevname
            } else {
                Network.set_name(name)
                name = textinput_str
            }
        }
        editing_name = !editing_name
    })

    // draw avatar images in a like circle frame etc up here once complete. probably store all in a specific folder that is auto-filled 

    let tText = "Avatar: " + avatars[player_avatar].name
    drawText(tText, 600 - (canvas.measureText(tText).width / gameConsts.scale / 2), 300)
    addTextButton("prev", 430, 325, () => {
        // increment player's stored avatar ID by 1 % avatars.length
        player_avatar++
        player_avatar %= avatars.length
        Network.set_server_avatarID(player_avatar)
    })
    addTextButton("next", 700, 325, () => {
        player_avatar--
        player_avatar += avatars.length
        player_avatar %= avatars.length
        Network.set_server_avatarID(player_avatar)
        // decrement player's stored avatar ID by 1 % avatars.length
    })

    // name editor
    // name starts out "player+socket id"
    //  -> on submit, send to server name
    // avatar editor
    // increment avatar ID + 1 mod total number avatar IDs
    // 



    // if host, a "begin game" button
    setFont("40px")
    if (is_host) {
        addTextButton("Begin Game", js_leftmargin, 435, () => {
            Network.beginGame()
        })
    }
}

var room_ID = ""
var is_host = false
function hostscreen() {
    canvas.fillStyle = "white"
    setFont("20px")
    centerText("Hosting Room", 30)
    setFont("100px")
    if (typeof room_ID != "string") {
        centerText("- - - - -", 110)
    } else {
        centerText(room_ID, 110)
    }

    setFont("60px")
    addTextButton("Begin game", -100, 300, () => {
        game_state = 1
        is_host = true
    })
}
function loadingscreen() { }
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
function lyingscreen() { }
function findscreen() { }
var typed = []
window.addEventListener("keyup", (e) => {
    if (curr_textinput == 0 && e.key.match(/((backspace)|[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789])/))
        typed.push(e.key)
    if (curr_textinput == 1 && e.key.match(/((backspace)|[A-z0-9\ ])/)) {
        if (e.shiftKey)
            typed.push(e.key.toUpperCase())
        else
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
        if ((typed.length > 0) && typed[typed.length - 1] == "Enter") {
            server_join_res = await Network.JoinRoomResult(typed.join(""))
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
        if (typed[typed.length - 1] == "Enter") {
            if (name == "") {
                name = prevname
            } else {
                Network.set_name(name)
                name = textinput_str
            }
            editing_name = false
        }
        if ((canvas.measureText(typed.join("")).width / gameConsts.scale) > 300 || (typed.length > 0 && typed[typed.length - 1].length > 1)) {
            typed.pop()
        }
        // console.log(typed)
        textinput_str = typed.join("")
    }
}

sizeCvs()
//window.onresize = sizeCvs
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
function renderObjects(dt) {

}
// if x==-100, centered


function applyVignette() {
    // radial gradient centered at canvas center
    var gradient = canvas.createRadialGradient(
        400 * gameConsts.scale, 400 * gameConsts.scale, 0,  // Inner circle (center, radius 0)
        400 * gameConsts.scale, 400 * gameConsts.scale, Math.max(800 * gameConsts.scale, 400 * gameConsts.scale) / 2
        // Outer circle (center, radius half of max dimension)
    );

    // color stops for the gradient
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // center: fully transparent

    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)'); // inner area: fully transparent
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)'); // edges: semi-transparent dark color

    // 4. Apply the gradient
    canvas.fillStyle = gradient;
    fillRect(0, 0, 800, 400);
}

export { fillRect, setFont, drawText, drawImage };
