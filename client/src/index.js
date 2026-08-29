import * as Network from "./networking.js"

/*
BASE SCALE: 1600x900
*/
const gameScreenCvs = document.getElementById("gamescreen")
const canvas = gameScreenCvs.getContext("2d")

let buttonEvents = []
let buttonignoresignals = {}
let gameConsts = {
    width: 800,
    height: 450,
    scale: 1
}
let mouseX = 400
let mouseY = 400
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
countTPS()



gameScreenCvs.addEventListener("mousemove", (event) => {
    mouseX = event.offsetX / gameConsts.scale * window.devicePixelRatio
    mouseY = event.offsetY / gameConsts.scale * window.devicePixelRatio
})

var game_states = [
    mainmenu,
    joinscreen,
    hostscreen,
    findscreen,
    LIESscreen,
]
var game_state = 0

function _gameLoop() {
    canvas.fillStyle = "black"
    fillRect(0, 0, 1000, 1000)
    game_states[game_state]()
    // console.log(mouseX + "::" + mouseY)
}
var isJoinBtnClicked = false
var textinput_str = ""
var curr_textinput = 0
var server_join_req = -1
function mainmenu() {
    canvas.fillStyle = "white"
    setFont("60px")
    centerText("Web", 50)
    centerText("Of", 100)
    centerText("Lies", 150)
    drawImage(0, 0, 80, 80, "spiderweb-left.png")
    drawImage(800 - 80, 0, 80, 80, "spiderweb-right.png")

    setFont("30px")
    // 355,270 > 450,300
    if (server_join_req != -1) {
        console.log(server_join_req)
        if (server_join_req == 0) {
            // invalid
            errormsg = "Invalid join code"
        }
        if (server_join_req == 1) {
            // invalid
            errormsg = "Could not reach server"
        }
        if (server_join_req == 2) {
            game_state = 1
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

                server_join_req = await Network.JoinRoomResult(typed.join(""))
            })
        }

        canvas.fillStyle = "white"
        handleTextInput()
    }
    // centerText("· Join ·", 290)
    // 355, 300 > 450, 330
    addTextButton("Find", -100, 320, () => {
        console.log("Going to Find Server Screen")
        game_state = 3
    })
    // 355, 330 > 450, 360
    addTextButton("Host", -100, 350, () => {
        console.log("Going to Host Server Screen")
        game_state = 2
    })
}

function joinscreen() {

}
function hostscreen() { }
function findscreen() { }
function LIESscreen() { }

function countTPS() {
    return setInterval(() => {
        realTPS = _realTPSCounter;
        //console.debug(realTPS)
        _realTPSCounter = 0;
    }, 1000)
}
var typed = []
window.addEventListener("keyup", (e) => {
    if (curr_textinput == 0 && e.key.match(/((backspace)|[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789])/i))
        typed.push(e.key)

})
// textareas: 
// -- lying type in
// -- enter join code
function handleTextInput() {
    if (isJoinBtnClicked && game_state == 0) {
        curr_textinput = 0
        if (typed[typed.length - 1] == "Backspace") {
            typed.pop()
            typed.pop()
        }
        if (typed.length > 5) {
            typed.pop()
        }
        // console.log(typed)
        textinput_str = typed.join(" ").padEnd(10, " _").toUpperCase()
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
function addTextButton(text, xpos, ypos, callback) {
    let fulltext = "· " + text + " ·"
    let addonwidth = canvas.measureText("<").width
    let w = canvas.measureText(fulltext).width
    let h = canvas.font.substring(0, canvas.font.indexOf("px")) / gameConsts.scale
    // console.log(h)
    let y = ypos
    let x = xpos
    let id = "btn:" + text
    if (xpos == -100) {
        // console.log("centered!")
        x = ((800 - (canvas.measureText(fulltext).width / gameConsts.scale)) / 2)
    }
    if (buttonEvents.indexOf(id) == -1) {
        buttonignoresignals[id] = false
        buttonEvents.push(id)
        gameScreenCvs.addEventListener("mouseup", () => {
            if (buttonignoresignals[id]) {
                buttonignoresignals[id] = false
                return
            }
            if (mouseInArea(x, y - h, (x + w), (y))) {
                callback()
            }
            buttonEvents.splice(buttonEvents.indexOf(id), 1)

        }, { once: true })
    }
    if (mouseInArea(x, y - h, (x + w), (y))) {
        fulltext = "·> " + text + " <·"
        drawText(fulltext, x - (.5 * addonwidth), y)
    } else {
        drawText(fulltext, x, y)

    }
    // console.log(fulltext + "::" + x + "::" + y)
}

function addButton(id, src, x, y, w, h, callback, options) {

    if (buttonEvents.indexOf(id) == -1) {
        buttonignoresignals[id] = false

        buttonEvents.push(id)
        gameScreenCvs.addEventListener("mouseup", () => {
            if (buttonignoresignals[id]) {
                buttonignoresignals[id] = false
                return
            }
            if (mouseInArea(x, y, (x + w), (y + h))) {
                callback()
            }
            buttonEvents.splice(buttonEvents.indexOf(id), 1)

        }, { once: true })

    }

    if (mouseInArea(x, y, (x + w), (y + h))) {
        canvas.filter = "brightness(140%)"
    }

    drawImage(x, y, w, h, src)

    canvas.filter = "none"
}

function mouseInArea(sX, sY, eX, eY) {
    return (mouseX > sX && mouseX < eX && mouseY > sY && mouseY < eY)
}

function fillRect(x, y, w, h) {
    canvas.fillRect(x * gameConsts.scale, y * gameConsts.scale, w * gameConsts.scale, h * gameConsts.scale)
}

function setFont(font) {
    canvas.font = font.substring(0, font.indexOf("p")) * gameConsts.scale + "px Glass"
}

function drawText(str, x, y, maxWidth) {
    if (typeof maxWidth == 'undefined') {
        canvas.fillText(str, x * gameConsts.scale, y * gameConsts.scale)
    }
    canvas.fillText(str, x * gameConsts.scale, y * gameConsts.scale, maxWidth * gameConsts.scale)
}

function centerText(str, y) {
    canvas.fillText(str, ((800 - (canvas.measureText(str).width / gameConsts.scale)) / 2) * gameConsts.scale, y * gameConsts.scale)
}

var imgs = {}
function drawImage(x, y, w, h, src) {
    if (typeof src === "undefined") {
        return
    }
    try {
        if (!imgs[src]) {
            imgs[src] = new Image()
            imgs[src].src = "../public/img/" + src
            console.log(imgs[src])
        }
        canvas.drawImage(imgs[src], Math.floor(x * gameConsts.scale), Math.floor(y * gameConsts.scale), Math.ceil(w * gameConsts.scale), Math.ceil(h * gameConsts.scale))
    }
    catch (e) {
        console.log("Image source not found: " + src)
    }
    return;
}

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
