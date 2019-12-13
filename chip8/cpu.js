// https://en.wikipedia.org/wiki/CHIP-8
// http://www.codeslinger.co.uk/pages/projects/chip8/hardware.html

// BYTE = 1 byte
// WORD = 2 bytes

MIDNIGHT = {
    fg: "#d387ff",
    bg: "#380c52",
}

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

        CHIP8.handleTimers();
        DEBUGGER.report(nextOp, CHIP8.do(nextOp));
    },

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
                return CHIP8.handleOp0(op & 0xfff);
            case 0x1:
                // JUMP opcode (0x1NNN)
                if ((op & 0x0fff) == CHIP8.r.PC - 0x2) {
                    CHIP8.r.PC = op & 0x0fff;
                    return CODES.terminate;
                }
                CHIP8.r.PC = op & 0x0fff;
                return CODES.jump;
            case 0x2:
                // CALL SUBROUTINE (0x2NNN)
                // Function call (advanced jump)
                CHIP8.ST[CHIP8.r.SP] = CHIP8.r.PC;
                CHIP8.r.SP += 1;
                CHIP8.r.PC = op & 0x0fff;
                return CODES.call;
            case 0x3:
                // EQUALS OP (0x3XNN)
                // Skips next instruction
                // if VX == NN
                if (CHIP8.r.V[secondDigit] == (op & 0xff)) {
                    CHIP8.r.PC += 2;
                }
                return CODES.eq;
            case 0x4:
                // NOT EQUALS OP (0x4XNN)
                // Skips next instruction
                // if VX != NN
                if (CHIP8.r.V[secondDigit] != (op & 0xff)) {
                    CHIP8.r.PC += 2;
                }
                return CODES.neq;
            case 0x5:
                // EQUALS REG OP (0x5XY0)
                // Skips next instruction
                // if VX == VY
                if (fourthDigit == 0) {
                    if (CHIP8.r.V[secondDigit] == CHIP8.r.V[thirdDigit]) {
                        CHIP8.r.PC += 2;
                    }
                    return CODES.eqReg;
                }
            case 0x6:
                // LOAD TO REG (0x6XNN)
                // Sets VX to NN.
                CHIP8.r.V[secondDigit] = op & 0xff;
                return CODES.loadToReg;
            case 0x7:
                // ADD TO REG (0x7XNN)
                // Sets VX to VX + NN.
                CHIP8.r.V[secondDigit] += op & 0xff;
                return CODES.addToReg;
            case 0x8:
                // Handle math!
                return CHIP8.handleMath(fourthDigit, secondDigit, thirdDigit);
            case 0x9:
                // NOT EQUALS REG OP (0x9XY0)
                // Skips next instruction
                // if VX != VY
                if (fourthDigit == 0) {
                    if (CHIP8.r.V[secondDigit] != CHIP8.r.V[thirdDigit]) {
                        CHIP8.r.PC += 2;
                    }
                    return CODES.neqReg;
                }
            case 0xA:
                // SET I opcode (0xANNN)
                CHIP8.r.I = op & 0x0fff;
                return CODES.setI;
            case 0xB:
                // JUMP + V opcode (0xBNNN)
                CHIP8.r.PC = (op & 0x0fff) + CHIP8.r.V[0];
                return CODES.jumpV;
            case 0xC:
                // SET RANDOM to V opcode (0xCXNN)
                let rand = Math.floor(Math.random() * 256);
                CHIP8.r.V[secondDigit] = rand & (op & 0xff);
                return CODES.setRand;
            case 0xD:
                // DRAW CODE
                CHIP8_GRAPHICS.drawSprite(secondDigit, thirdDigit, fourthDigit);
                return CODES.draw;
            case 0xE:
                return CHIP8.handleOpE(secondDigit, op & 0xff);
            case 0xF:
                return CHIP8.handleOpF(secondDigit, op & 0xff);
            default:
                console.error("opcode not supported: " + hex(op));
        }

        return CODES.unknown;
    },

    handleOpE: function(reg, mode) {
        // TODO: CHIP8.colorRaise = "#be2edd";
        switch (mode) {
            case 0x9E:
            case 0xA1:
            default:
                console.error("Key 0xE code not supported: " + hex(mode));
        }

        return CODES.unknown;
    },

    handleTimers: function() {
        if (CHIP8.r.TD > 0) {
            CHIP8.r.TD -= 1;
        }
        if (CHIP8.r.TS > 0) {
            CHIP8.r.TS -= 1;
        }
    },

    handleOpF: function(reg, mode) {
        switch (mode) {
            case 0x07:
                // SET VX to DELAY TIMER
                CHIP8.r.V[reg] = CHIP8.r.TD;
                return CODES.getDelay;
            case 0x15:
                // SET DELAY TIMER to VX
                CHIP8.r.TD = CHIP8.r.V[reg];
                return CODES.setDelay;
            case 0x18:
                // SET SOUND TIMER to VX
                CHIP8.r.TS = CHIP8.r.V[reg];
                return CODES.setSound;
            case 0x1E:
                // ADD VX TO I
                if (CHIP8.r.I + CHIP8.r.V[reg] > 0xfff) {
                    CHIP8.r.V[0xf] = 1;
                }
                CHIP8.r.I += CHIP8.r.V[reg];
                return CODES.addI;
            case 0x33:
                // CONVERTS VX TO DECIMAL; DUMPS
                // BASE-10 DIGITS TO MEMORY
                let rn = CHIP8.r.V[reg];
                for (let d = 0; d <= 2; d++) {
                    CHIP8_MEM[CHIP8.r.I + d] = (Math.floor(rn / Math.pow(10, 2 - d))) % 10;
                }
                return CODES.decimalize;
            case 0x55:
                // DUMP V0~VX TO MEMORY
                for (let i = 0x0; i <= reg; i++) {
                    CHIP8_MEM[CHIP8.r.I + i] = CHIP8.r.V[i];
                }
                return CODES.dumpReg;
            case 0x65:
                // RESTORE FROM MEMORY TO V0~VX
                for (let i = 0x0; i <= reg; i++) {
                    CHIP8.r.V[i] = CHIP8_MEM[CHIP8.r.I + i];
                }
                return CODES.restoreReg;
            case 0x0A:
            case 0x29:
            default:
                console.error("0xF code not supported: " + hex(mode));
        }

        return CODES.unknown;
    },

    handleOp0: function(mode) {
        switch(mode) {
            case 0xE0:
                CHIP8_GRAPHICS.clear();
                return CODES.dispclear;
            case 0xEE:
                CHIP8.r.SP -= 1;
                CHIP8.r.PC = CHIP8.ST[CHIP8.r.SP];
                CHIP8.ST[CHIP8.r.SP] = 0;
                return CODES.return;
            default:
                console.error("RCA 1802 (" + mode.toString(16) + ") not supported: " + hex(mode));
        }

        return CODES.unknown;
    },

    handleMath: function(mode, x, y) {
        switch (mode) {
            case 0x0:
                CHIP8.r.V[x] = CHIP8.r.V[y]
                return CODES.copyReg;
            case 0x1:
                CHIP8.r.V[x] |= CHIP8.r.V[y]
                return CODES.or;
            case 0x2:
                CHIP8.r.V[x] &= CHIP8.r.V[y]
                return CODES.and;
            case 0x3:
                CHIP8.r.V[x] ^= CHIP8.r.V[y]
                return CODES.xor;
            case 0x4:
                if (CHIP8.r.V[x] + CHIP8.r.V[y] > 0xff) {
                    CHIP8.r.V[0xf] = 1;
                }
                CHIP8.r.V[x] += CHIP8.r.V[y]
                return CODES.add;
            case 0x5:
                if (CHIP8.r.V[x] > CHIP8.r.V[y]) {
                    CHIP8.r.V[0xf] = 1;
                }
                CHIP8.r.V[x] -= CHIP8.r.V[y]
                return CODES.sub;
            case 0x6:
                CHIP8.r.V[0xf] = CHIP8.r.V[x] & 0x1;
                CHIP8.r.V[x] >>= 1;
                return CODES.rightShift;
            case 0x7:
                if (CHIP8.r.V[y] > CHIP8.r.V[x]) {
                    CHIP8.r.V[0xf] = 1;
                }
                CHIP8.r.V[x] = CHIP8.r.V[y] - CHIP8.r.V[x]
                return CODES.subInv;
            case 0xE:
                CHIP8.r.V[0xf] = CHIP8.r.V[x] != 0x0 ? 0x1 : 0x0;
                CHIP8.r.V[x] <<= 1;
                return CODES.leftShift;
            default:
                console.error("math opcode not supported: 0x" + hex(mode));
        }

        return CODES.unknown;
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
        for (let p = 0; p < CHIP8_GRAPHICS.buffer.length; p++) {
            let x = p % 64, y = Math.floor(p / 64);
            ctx.fillStyle = MIDNIGHT.bg;
            ctx.fillRect(x * 10, y * 10, 10, 10);

            if (CHIP8_GRAPHICS.buffer[p] > 0) {
                ctx.fillStyle = MIDNIGHT.fg;
                ctx.fillRect(x * 10 + 1, y * 10 + 1, 8, 8);
            }
        }
    },
    
    drawSprite: function(x, y, n) {
        // Starting from (x, y),
        // reads N bytes from memory
        // starting at I. Each byte represents
        // one 8-pixel row.
        
        x = CHIP8.r.V[x];
        y = CHIP8.r.V[y];

        let ctx = document.getElementById("screen").getContext("2d");
        ctx.clearRect(x, y, 8, n);

        CHIP8.r.V[0xF] = 0;
        for (let ind = 0; ind < n; ind++) {
            let row = CHIP8_MEM[CHIP8.r.I + ind];
            let ny = (y + ind) % 32;
            for (let tx = 0; tx < 8; tx++) {
                let nx = (x + (7 - tx)) % 64; 
                let p = nx + (ny * 64);
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

    forceWash: function() {
        let ctx = document.getElementById("screen").getContext("2d");
        ctx.fillStyle = MIDNIGHT.bg;
        ctx.fillRect(0, 0, 640, 360);
    },

    clear: function() {
        // TODO: Add more to clear.
        CHIP8_GRAPHICS.forceWash();
        CHIP8_GRAPHICS.buffer = new Uint8Array(new ArrayBuffer(64*32));
    }
}

let FPS_INTERVAL = 1;

function loadROM(fileList) {
    if (fileList.length > 0) {
        document.getElementById("romInput").hidden = true;
        document.getElementById("romHelper").hidden = true;
        document.getElementById("helperText2").hidden = true;
        document.getElementById("helperText").innerHTML = `<b>Nice!</b> You can now use the controls below to start emulating.
        <br>Use the left shoulder of your keyboard (1-4, Q-R, A-F, Z-V) as
        <br>the hexpad input. You can also see the "Keys" tab for key bindings.
        <br><br>To load a different ROM, please refresh the page.
        <br><br>Enjoy the emulator!`
        
        // Load it into memory!
        fileList[0].arrayBuffer().then((b) => {
            console.log("ROM read completed, size = " + new Uint8Array(b).length);
            CHIP8.memLoad(b);
            drawDebugger();
        })
    } else {
        console.log("change found, but no files uploaded.");
    }
}

let clockInterval;

function startLoop() {
    clearLoop();
    FPS_INTERVAL = 1;
    clockInterval = setInterval(loop, FPS_INTERVAL);
}

function startSlowLoop() {
    clearLoop();
    DEBUGGER.slowMode = true;
    FPS_INTERVAL = 200;
    clockInterval = setInterval(loop, FPS_INTERVAL);
}

function loop() {
    CHIP8.read();
    drawDebugger();
}

function init() {
    CHIP8_GRAPHICS.clear();
    CHIP8_GRAPHICS.draw();
    drawDebugger();
}

function clearLoop() {
    if (clockInterval) {
        clearInterval(clockInterval);
        DEBUGGER.slowMode = false;
        clockInterval = 0;
    }
}