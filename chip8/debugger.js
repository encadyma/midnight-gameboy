DEBUGGER = {
    lastErrors: [],
    lastOps: [],
    ET: 0,      // Error Timer (cycles to show error),
    menuChoices: [
        "MEMORY",
        "CPU",
        "KEYS",
        "DEBUG",
        "DISPLAY"
    ],
    currentChoice: "MEMORY",
    report: function(op, type) {
        DEBUGGER.lastOps.push({ op, type })
    },
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

    if (DEBUGGER.currentChoice == "MEMORY") {
        drawMemory();
    } else {
        drawUnknown();
    }
}

function drawMemory() {
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

function drawUnknown() {
    ctx.clearRect(0, 0, 640, 256);
    ctx.fillStyle = MIDNIGHT.fg;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VIEW NOT IMPLEMENTED', 320, 120);
    ctx.font = '10px monospace';
    ctx.fillText('(please choose another menu)', 320, 140);
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

    shouldRefresh = true;
    drawDebugger();
}