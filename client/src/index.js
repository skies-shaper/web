import { Vec } from "./utils.js"
import { moveRectCollideMovingRect, rectRectOverlaps, rectCircleOverlaps } from "./collisions.js"

import keyHandler from "./keyhandler.js"

/*
BASE SCALE: 1600x900
*/

keyHandler.setKeyBindings({
    //"moveUp": ["KeyW", "ArrowUp"],
    //"moveDown": ["KeyS", "ArrowDown"],
    "moveLeft": ["KeyA", "ArrowLeft"],
    "moveRight": ["KeyD", "ArrowRight"],
    'jump': ['Space', 'ArrowUp', 'KeyW'],
    'throwTape': ['MouseLeft'],
    'reset': ["KeyR"]
})
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



const COYOTE_TIME = 0.1
const JUMP_BUFFER = 0.1

const JUMP_VEL = 900

const AIR_FRICTION = 0.98
const GROUND_FRICTION = 0.999999

const GRAVITY_ACCEL = 600
const GRAVITY_DOWNWARDS_ACCEL = 600
const GROUND_MOVE_ACCEL = 1300
const AIR_MOVE_ACCEL = 200

let player = {
    direction: 1,
    pos: { x: 300, y: 200 }, // CENTER
    vel: { x: 0, y: 0 },
    size: { x: 35, y: 55 },

    jumpTime: 0, // stores coyote time
    jumpBuffer: 0, // buffer that allows jumping if space was pressed early
    numTapes: 0,
    frame: 0,
    maxFrames: 5,
    frame: 0,
    width: 35,
    height: 55,
    moveState: 0,
    moveStates: {
        idle: 0,
        moving: 1,
        slide: 2,
        jump: 3,
        swing: 4
    },

    grounded: false
}

keyHandler.onInputDown('jump', () => {
    player.jumpBuffer = JUMP_BUFFER
})

keyHandler.onInputDown('throwTape', () => {
    if (!tape.launched && inGameplay) {
        if (player.numTapes == 0) {
            return
        }
        player.numTapes--
        tape.launched = true

        tape.released = false
        tapeRip.pos(tape.pos.x * HOWLER_POS_SCALE, tape.pos.y * HOWLER_POS_SCALE)
        tapeRip.play()

        tape.particles.push({ start: Vec.copy(player.pos), end: null })
    }
})
setInterval(() => {
    _gameLoop()

}, (1000 / 60))
countTPS()



gameScreenCvs.addEventListener("mousemove", (event) => {
    mouseX = event.offsetX / gameConsts.scale * window.devicePixelRatio
    mouseY = event.offsetY / gameConsts.scale * window.devicePixelRatio
})

function _gameLoop() {
    canvas.fillStyle = "red"
    console.log("hello!")
    fillRect(0, 0, 400, 400)
}

function countTPS() {
    return setInterval(() => {
        realTPS = _realTPSCounter;
        //console.debug(realTPS)
        _realTPSCounter = 0;
    }, 1000)
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
    canvas.font = font.substring(0, font.indexOf("p")) * gameConsts.scale + "px Lacquer"
}

function drawText(str, x, y, maxWidth) {
    if (typeof maxWidth == 'undefined') {
        canvas.fillText(str, x * gameConsts.scale, y * gameConsts.scale)
    }
    canvas.fillText(str, x * gameConsts.scale, y * gameConsts.scale, maxWidth * gameConsts.scale)
}

function drawImage(x, y, w, h, src) {
    if (typeof src === "undefined") {
        return
    }
    try {
        const i = document.getElementById(src)
        canvas.drawImage(i, Math.floor(x * gameConsts.scale), Math.floor(y * gameConsts.scale), Math.ceil(w * gameConsts.scale), Math.ceil(h * gameConsts.scale))
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
