DEBUGGER = {
    lastErrors: [],
    lastOps: [],
    ET: 0,      // Error Timer (cycles to show error),
    menuChoices: [
        "MAIN",
        "MEMORY",
        "CPU",
        "KEYS",
        "DEBUG",
        "DISPLAY"
    ],
    currentChoice: "MAIN",
    report: function(op, type) {
        DEBUGGER.lastOps.push({ op, type })
    },
    slowMode: false,
}

function dumpGraphics() {
    let flog = "DISPLAY\n========================\n";

    let d = [];
    for (let y = 0; y < 32; y++) {
        let rowStr = [];
        for (let x = 0; x < 64; x++) {
            let p = x + (y * 64);
            rowStr.push(CHIP8_GRAPHICS.buffer[p] > 0 ? "o" : " ");
        }
        d.push("R" + y + "\t" + rowStr.join(""))
    }
    flog += d.join("\n");

    document.getElementById("dump").innerHTML = flog;
}

function dumpCPU() {
    document.getElementById("dump").innerHTML = JSON.stringify(CHIP8, null, 2);
}

function drawDebugger() {
    drawStatus();
    drawMenu();
    drawMain();
}

let ctx = document.getElementById("memview").getContext("2d");
let shouldRefresh = true;

function drawMain() {
    if (shouldRefresh) {
        ctx.clearRect(0, 0, 640, 256);
        shouldRefresh = false;
    }

    drawMemorySide();

    if (DEBUGGER.currentChoice == "MAIN") {
        drawMainMenu();
    } else if (DEBUGGER.currentChoice == "MEMORY") {
        drawMemory();
    } else if (DEBUGGER.currentChoice == "CPU") {
        drawCPU();
    } else {
        drawUnknown();
    }
}

function drawMemorySide() {
    for (let m = 0; m < CHIP8_MEM.length; m++) {
        let x = m % 64, y = Math.floor(m / 64);
        if (CHIP8.r.PC == m) {
            ctx.fillStyle = getLastOpColor();
        } else if (CHIP8_MEM[m] > 0) {
            ctx.fillStyle = MIDNIGHT.fg;
        } else {
            ctx.fillStyle = MIDNIGHT.bg;
        }
        ctx.fillRect(x * 4, y * 4, 4, 4);
    }

    ctx.clearRect(270, 0, 370, 256);

    ctx.fillStyle = getLastOpColor() + "66";
    ctx.fillRect(272, 6, 240, 28);
    ctx.fillStyle = "#ddaa00";
    ctx.fillRect(270, 5, 30, 30);
    ctx.fillStyle = getLastOpColor() + "CC";
    ctx.fillRect(272, 7, 26, 26);
    ctx.font = '14px monospace';
    ctx.textAlign = 'start';
    ctx.fillStyle = "#ddaa00";
    ctx.fillText(getLastInstr(), 310, 25);
}

let mainBtns = [];

function drawMainMenu() {
    ctx.clearRect(270, 40, 370, 210);
    ctx.fillStyle = MIDNIGHT.fg;
    mainBtns = [
        drawTextBtn(270, 50, 40, 40, "Play", "\u25B6", startLoop),
        drawTextBtn(320, 50, 40, 40, "Slow", "s\u25B7", startSlowLoop),
        drawTextBtn(370, 50, 40, 40, "Pause", "\u23F8", clearLoop),
        drawTextBtn(420, 50, 40, 40, "Step", "\u25CE", loop)
    ]
}

function drawCPU() {
    ctx.clearRect(270, 40, 370, 210);
    ctx.fillStyle = MIDNIGHT.fg;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CPU NOT IMPLEMENTED', 455, 120);
    ctx.font = '10px monospace';
    ctx.fillText('(please choose another menu)', 455, 140);
}

function drawMemory() {
    ctx.clearRect(270, 40, 370, 210);
    ctx.fillStyle = MIDNIGHT.fg;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MEMORY NOT IMPLEMENTED', 455, 120);
    ctx.font = '10px monospace';
    ctx.fillText('(please choose another menu)', 455, 140);
}

function drawUnknown() {
    ctx.clearRect(270, 40, 370, 210);
    ctx.fillStyle = MIDNIGHT.fg;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VIEW NOT IMPLEMENTED', 455, 120);
    ctx.font = '10px monospace';
    ctx.fillText('(please choose another menu)', 455, 140);
}

function drawTextBtn(x, y, w, h, text, lbl, cb) {
    ctx.fillStyle = MIDNIGHT.fg;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + (w / 2), y + h + 14);

    return drawBtn(x, y, w, h, lbl, cb);
}

function drawBtn(x, y, w, h, lbl, cb) {
    ctx.clearRect(x, y, w, h);
    ctx.fillStyle = MIDNIGHT.fg + "AA";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = MIDNIGHT.bg;
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.fillStyle = MIDNIGHT.fg + "AA";
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lbl, x + (w / 2), y + (h / 2) + 4);

    return {x, y, w, h, cb}
}

function getLastOp() {
    if (DEBUGGER.lastOps.length > 0) {
        return hex(DEBUGGER.lastOps[DEBUGGER.lastOps.length - 1].op);
    } else {
        return "---";
    }
}

function getLastInstr() {
    if (DEBUGGER.lastOps.length > 0) {
        return hex(DEBUGGER.lastOps[DEBUGGER.lastOps.length - 1].type.name(
            DEBUGGER.lastOps[DEBUGGER.lastOps.length - 1].op));
    } else {
        return "NULL";
    }
}

function getLastOpColor() {
    if (DEBUGGER.lastOps.length > 0) {
        return hex(DEBUGGER.lastOps[DEBUGGER.lastOps.length - 1].type.color);
    } else {
        return "#444444";
    }
}

function drawStatus() {
    // Draw Status
    ctx.clearRect(0, 256, 256, 24);
    ctx.fillStyle = "#ddaa00";
    ctx.font = '14px monospace';
    ctx.textAlign = 'start';
    ctx.fillText('s: ' + (1000 / FPS_INTERVAL).toFixed(0) + '/s', 10, 274);
    ctx.fillText('pc: ' + hex(CHIP8.r.PC), 100, 274);
    ctx.fillStyle = getLastOpColor();
    ctx.fillText('opc: ' + hex(getLastOp()), 172, 274);
}

function drawMenu() {
    ctx.clearRect(0, 280, 320, 50);
    ctx.fillStyle = "10px monospace";
    ctx.textAlign = 'start';

    DEBUGGER.menuChoices.forEach((choice, i) => {
        ctx.fillStyle = choice == DEBUGGER.currentChoice ? MIDNIGHT.fg : MIDNIGHT.bg;
        ctx.fillRect(90 * i, 285, 80, 20);
        ctx.fillStyle = choice == DEBUGGER.currentChoice ? MIDNIGHT.bg : MIDNIGHT.fg;
        ctx.fillRect(90 * i, 290, 5, 10);
        ctx.fillText(choice, 12 + 90 * i, 300);
    })
}

function logErr(msg) {
    console.error("[log] " + msg);
    DEBUGGER.lastErrors.push(msg);
    DEBUGGER.ET = 100;
}

let screen = document.getElementById("memview")

screen.onclick = function (event) {
    const x = event.pageX - screen.offsetLeft,
        y = event.pageY - screen.offsetTop;

    // Handle menu clicks!
    if (y >= 285 && y <= 305) {
        if (Math.floor(x / 90) < DEBUGGER.menuChoices.length) {
            DEBUGGER.currentChoice = DEBUGGER.menuChoices[Math.floor(x / 90)]
        }
    }

    // Main menu buttons
    mainBtns.forEach((btn) => {
        if (x >= btn.x && x <= btn.x + btn.w
            && y >= btn.y && y <= btn.y + btn.h) {
                btn.cb();
                return;
            }
    })

    shouldRefresh = true;
    drawDebugger();
}