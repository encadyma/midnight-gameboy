// https://en.wikipedia.org/wiki/CHIP-8
// http://www.codeslinger.co.uk/pages/projects/chip8/hardware.html

// BYTE = 1 byte
// WORD = 2 bytes

CHIP8 = {
    r: {
        // 8-bit registers
        // Doubles as special FLAG
        V: new Uint8Array(new ArrayBuffer(16)),

        I: 0,       // ADDRESS REGISTER (16-bit)
        PC: 0,      // PROGRAM COUNTER (16-bit)
        SP: 0,      // STACK POINTER (points to empty top)

        TD: 0,      // DELAY TIMER
        TS: 0,      // SOUND TIMER
    },

    ST: new Uint16Array(new ArrayBuffer(64)), // THE STACK!

    // Loads in bytes from PRGMBUFFER onto 0x200-.
    memLoad(prgmBuffer) {
        console.log("Loading program buffer into memory.")

        CHIP8.r.I = 0;
        CHIP8.r.PC = 0x200;

        CHIP8.r.V = new Uint8Array(new ArrayBuffer(16));
        prgm = new Uint8Array(prgmBuffer);

        for (let i = 0; i < prgm.length; i++) {
            CHIP8_MEM[i + 0x200] = prgm[i];
        }
    },

    // Consumes from memory the next operation.
    // Reads for one word/two bytes!
    read: function() {
        nextOp = CHIP8_MEM[CHIP8.r.PC];
        nextOp <<= 8;
        nextOp |= CHIP8_MEM[CHIP8.r.PC + 1];
        CHIP8.r.PC += 2;
        CHIP8.lastOp = nextOp;
        CHIP8.do(nextOp);
    },

    lastOp: 0,
    colorRaised: "#88dd00",

    // Performs an opcode operation
    // Needs to handle all 35 opcodes!
    do: function(op) {
        firstDigit = (op & 0xf000) >> 12;
        secondDigit = (op & 0x0f00) >> 8;
        thirdDigit = (op & 0x00f0) >> 4;
        fourthDigit = op & 0x000f;

        switch (firstDigit) {
            case 0x0:
                // handle 0x0..
                CHIP8.colorRaised = "#95a5a6";
                console.error("0x0 not supported: " + hex(op));
                break;
            case 0x1:
                // JUMP opcode (0x1NNN)
                CHIP8.r.PC = op & 0x0fff;
                CHIP8.colorRaised = "#1abc9c";
                break;
            case 0x2:
                // CALL SUBROUTINE (0x2NNN)
                // Function call (advanced jump)
                CHIP8.ST[CHIP8.r.SP] = CHIP8.r.PC;
                CHIP8.r.SP += 1;
                CHIP8.r.PC = op & 0x0fff;
                CHIP8.colorRaised = "#9b59b6";
                break;
            case 0x3:
                // EQUALS OP (0x3XNN)
                // Skips next instruction
                // if VX == NN
                if (CHIP8.r.V[secondDigit] == op & 0xff) {
                    CHIP8.r.PC += 2;
                }
                CHIP8.colorRaised = "#3B3B98";
                break;
            case 0x4:
                // NOT EQUALS OP (0x4XNN)
                // Skips next instruction
                // if VX != NN
                if (CHIP8.r.V[secondDigit] != op & 0xff) {
                    CHIP8.r.PC += 2;
                }
                CHIP8.colorRaised = "#6D214F";
                break;
            case 0x5:
                // EQUALS REG OP (0x5XY0)
                // Skips next instruction
                // if VX == VY
                if (fourthDigit == 0) {
                    if (CHIP8.r.V[secondDigit] == CHIP8.r.V[thirdDigit]) {
                        CHIP8.r.PC += 2;
                    }
                    CHIP8.colorRaised = "#3B3B98";
                    break;
                }
            case 0x6:
                // LOAD TO REG (0x6XNN)
                // Sets VX to NN.
                CHIP8.r.V[secondDigit] = op & 0xff;
                CHIP8.colorRaised = "#9AECDB";
                break;
            case 0x7:
                // ADD TO REG (0x7XNN)
                // Sets VX to NN.
                CHIP8.r.V[secondDigit] += op & 0xff;
                CHIP8.colorRaised = "#9AECDB";
                break;
            case 0x8:
                // Handle math!
                CHIP8.handleMath(fourthDigit, secondDigit, thirdDigit);
                CHIP8.colorRaised = "#FC427B";
                break;
            case 0x9:
                // NOT EQUALS REG OP (0x9XY0)
                // Skips next instruction
                // if VX != VY
                if (fourthDigit == 0) {
                    if (CHIP8.r.V[secondDigit] != CHIP8.r.V[thirdDigit]) {
                        CHIP8.r.PC += 2;
                    }
                    CHIP8.colorRaised = "#3B3B98";
                    break;
                }
            case 0xA:
                // SET I opcode (0xANNN)
                CHIP8.r.I = op & 0x0fff;
                CHIP8.colorRaised = "#CAD3C8";
                break;
            case 0xB:
                // JUMP + V opcode (0xBNNN)
                CHIP8.r.PC = (op & 0x0fff) + CHIP8.r.V[0];
                CHIP8.colorRaised = "#1abc9c";
                break;
            case 0xC:
                // SET RANDOM to V opcode (0xCXNN)
                let rand = Math.floor(Math.random() * 256);
                CHIP8.r.V[secondDigit] = rand & (op & 0xff);
                CHIP8.colorRaised = "#BDC581";
                break;
            case 0xD:
                CHIP8_GRAPHICS.drawSprite(secondDigit, thirdDigit, fourthDigit);
                CHIP8.colorRaised = "#badc58";
                break;
            case 0xE:
            case 0xF:
            default:
                CHIP8.colorRaised = "#ff0000";
                console.error("opcode not supported: " + hex(op));
        }
    },

    handleMath: function(mode, x, y) {
        switch (mode) {
            case 0x0:
                CHIP8.r.V[x] = CHIP8.r.V[y]
                break;
            case 0x1:
                CHIP8.r.V[x] |= CHIP8.r.V[y]
                break;
            case 0x2:
                CHIP8.r.V[x] &= CHIP8.r.V[y]
                break;
            case 0x3:
                CHIP8.r.V[x] ^= CHIP8.r.V[y]
                break;
            case 0x4:
            case 0x5:
            case 0x6:
            case 0x7:
            case 0xE:
            default:
                CHIP8.colorRaised = "#ff0000";
                console.error("math opcode not supported: 0x" + hex(mode));
        }
    },
}

// There are 0xFFF (~4096) bytes of memory here.
CHIP8_MEM = new Uint8Array(new ArrayBuffer(4096));

CHIP8_GRAPHICS = {
    // To fit a resolution of 64x32. Might
    // as well give it a full byte..
    buffer: new Uint8Array(new ArrayBuffer(64*32)),

    // NAIVE drawing function
    draw: function() {
        let ctx = document.getElementById("screen").getContext("2d");
        ctx.clearRect(0, 0, 640, 320);
        for (let p = 0; p < CHIP8_GRAPHICS.buffer.length; p++) {
            let x = p % 64, y = Math.floor(p / 64);
            if (CHIP8_GRAPHICS.buffer[p] > 0) {
                ctx.fillStyle = "#111111";
            } else {
                ctx.fillStyle = "#eeeeee";
            }
            ctx.fillRect(x * 10, y * 10, 10, 10);
        }
    },

    drawSprite: function(x, y, n) {
        // Starting from (x, y),
        // reads N bytes from memory
        // starting at I. Each byte represents
        // one 8-pixel row.
        
        x = CHIP8.r.V[x];
        y = CHIP8.r.V[y];

        CHIP8.r.V[0xF] = 0;
        for (let ind = 0; ind < n; ind++) {
            let row = CHIP8_MEM[CHIP8.r.I + ind];
            let ny = y + ind;
            for (let t = 0; t < 8; t++) {
                let p = (x + (7 - t)) + (ny * 32);
                let old = CHIP8_GRAPHICS.buffer[p];
                CHIP8_GRAPHICS.buffer[p] ^= row & 0x1;
                if (old == 0x1 && CHIP8_GRAPHICS.buffer[p] == 0x0) {
                    CHIP8.r.V[0xF] = 1;
                }
                row >>= 1;
            }
        }
        CHIP8_GRAPHICS.draw();
    },

    clear: function() {
        // TODO: Add more to clear.
        CHIP8_GRAPHICS.buffer = new Uint8Array(new ArrayBuffer(64*32));
    }
}

let FPS_INTERVAL = 16;

function dumpGraphics() {
    let d = [];
    for (let y = 0; y < 32; y++) {
        let rowStr = [];
        for (let x = 0; x < 64; x++) {
            let p = x + (y * 32);
            rowStr.push(CHIP8_GRAPHICS.buffer[p] > 0 ? "o" : " ");
        }
        d.push("R" + y + "\t" + rowStr.join(""))
    }
    document.getElementById("dump").innerHTML = d.join("\n")
}

function dumpCPU() {
    document.getElementById("dump").innerHTML = JSON.stringify(CHIP8, null, 2);
}

function drawMemory() {
    let ctx = document.getElementById("memview").getContext("2d");
    for (let m = 0; m < CHIP8_MEM.length; m++) {
        let x = m % 64, y = Math.floor(m / 64);
        if (CHIP8.r.PC == m) {
            ctx.fillStyle = "#ddaa00";
        } else if (CHIP8_MEM[m] > 0) {
            ctx.fillStyle = "#00dddd";
        } else {
            ctx.fillStyle = "#dddddd";
        }
        ctx.fillRect(x * 4, y * 4, 4, 4);
    }

    // Draw Status
    ctx.clearRect(0, 256, 256, 24);
    ctx.fillStyle = "#ddaa00";
    ctx.font = '14px monospace';
    ctx.fillText('fps: ' + (1000 / FPS_INTERVAL).toFixed(2), 10, 272);
    ctx.fillText('pc: ' + hex(CHIP8.r.PC), 100, 272);
    ctx.fillStyle = CHIP8.colorRaised;
    ctx.fillText('opc: ' + hex(CHIP8.lastOp), 170, 272);
}

function loadROM(fileList) {
    if (fileList.length > 0) {
        document.getElementById("romInput").hidden = true;
        
        // Load it into memory!
        fileList[0].arrayBuffer().then((b) => {
            console.log("ROM read completed, size = " + new Uint8Array(b).length);
            CHIP8.memLoad(b);
            drawMemory();
        })
    } else {
        console.log("change found, but no files uploaded.");
    }
}

let clockInterval;

function startLoop() {
    clockInterval = setInterval(loop, FPS_INTERVAL);
}

function loop() {
    CHIP8.read();
    drawMemory();
}

function hex(num) {
    return num.toString(16);
}

function init() {
    CHIP8_GRAPHICS.draw();
    drawMemory();
}

function clearLoop() {
    if (clockInterval) {
        clearInterval(clockInterval);
    }
}