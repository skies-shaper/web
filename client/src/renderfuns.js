import {
    canvas, gameConsts,
    mouseX,
    mouseY, buttonEvents,
    buttonignoresignals, gameScreenCvs
} from "./index.js"
export function addTextButton(text, xpos, ypos, callback, _id) {
    let fulltext = "· " + text + " ·"
    let addonwidth = canvas.measureText("<").width
    let w = canvas.measureText(fulltext).width / gameConsts.scale
    let h = canvas.font.substring(0, canvas.font.indexOf("px")) / gameConsts.scale
    // console.log(h)
    let y = ypos
    let x = xpos
    let id = "btn:" + ypos + "::" + xpos
    if (typeof _id != "undefined") {
        id = _id
    }
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
                console.log("callback for button with", text)
                callback()
            }
            buttonEvents.splice(buttonEvents.indexOf(id), 1)

        }, { once: true })
    }
    if (mouseInArea(x, y - h, (x + w), (y))) {
        fulltext = "·> " + text + " <·"
        drawText(fulltext, x - (addonwidth / 2), y)
    } else {
        drawText(fulltext, x, y)

    }
    // console.log(fulltext + "::" + x + "::" + y)
}

export function addButton(id, src, x, y, w, h, callback, options) {

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

export function mouseInArea(sX, sY, eX, eY) {
    return (mouseX > sX && mouseX < eX && mouseY > sY && mouseY < eY)
}

export function fillRect(x, y, w, h) {
    canvas.fillRect(x * gameConsts.scale, y * gameConsts.scale, w * gameConsts.scale, h * gameConsts.scale)
}

export function setFont(font) {
    canvas.font = font.substring(0, font.indexOf("p")) * gameConsts.scale + "px Glass"
}

export function drawText(str, x, y, maxWidth) {
    if (typeof maxWidth == 'undefined') {
        canvas.fillText(str, x * gameConsts.scale, y * gameConsts.scale)
    }
    canvas.fillText(str, x * gameConsts.scale, y * gameConsts.scale, maxWidth * gameConsts.scale)
}

export function centerText(str, y) {
    canvas.fillText(str, ((800 - (canvas.measureText(str).width / gameConsts.scale)) / 2) * gameConsts.scale, y * gameConsts.scale)
}

var imgs = {}
export function drawImage(x, y, w, h, src) {
    if (typeof src === "undefined") {
        return
    }
    try {
        if (!imgs[src]) {
            imgs[src] = new Image()
            imgs[src].src = "../public/img/" + src
        }
        canvas.drawImage(imgs[src], Math.floor(x * gameConsts.scale), Math.floor(y * gameConsts.scale), Math.ceil(w * gameConsts.scale), Math.ceil(h * gameConsts.scale))
    }
    catch (e) {
        console.log("Image source not found: " + src)
    }
    return;
}