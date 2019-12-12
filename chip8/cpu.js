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
        ST: new Uint16Array(new ArrayBuffer(64)), // THE STACK,

        TD: 0,      // DELAY TIMER
        TS: 0,      // SOUND TIMER
    },

    // Loads in bytes from PRGMBUFFER onto 0x200-.
    memLoad(prgmBuffer) {
        console.log("Loading program buffer into memory.")

        CHIP8.r.I = 0;
        CHIP8.r.PC = 0x200;

        V = new Uint8Array(new ArrayBuffer(16));
        prgm = new Uint16Array(prgmBuffer);

        for (let i = 0; i < prgm.length; i++) {
            CHIP8_MEM[i + 0x200] = prgm[i];
        }

        drawMemory();
    },

    // Consumes from memory the next operation.
    // Reads for one word/two bytes!
    read: function() {
        nextOp = CHIP8_MEM[CHIP8.r.PC];
        nextOp <<= 8;
        nextOp |= CHIP8_MEM[CHIP8.r.PC + 1];
        CHIP8.r.PC += 2;
        console.log("next operation: " + hex(nextOp));
        CHIP8.do(nextOp);
    },

    // Performs an opcode operation
    // Needs to handle all 35 opcodes!
    do: function(op) {
        console.error("opcode not supported: " + hex(op));
    }
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
            if (CHIP8_GRAPHICS.buffer[p] > 0) {
                ctx.fillStyle = "#111111";
            } else {
                ctx.fillStyle = "#eeeeee";
            }
            ctx.fillRect(x * 10, y * 10, 10, 10);
        }
    }
}

function drawMemory() {
    let ctx = document.getElementById("memview").getContext("2d");
    for (let m = 0; m < CHIP8_MEM.length; m++) {
        let x = m % 64, y = Math.floor(m / 64);
        if (CHIP8_MEM[m] > 0) {
            ctx.fillStyle = "#00dddd";
        } else {
            ctx.fillStyle = "#dddddd";
        }
        ctx.fillRect(x * 1, y * 1, 1, 1);
    }
}

function loadROM(fileList) {
    if (fileList.length > 0) {
        document.getElementById("romInput").hidden = true;
        
        // Load it into memory!
        fileList[0].arrayBuffer().then((b) => {
            console.log("ROM read completed, size = " + new Uint8Array(b).length);
            CHIP8.memLoad(b);
        })
    } else {
        console.log("change found, but no files uploaded.");
    }
}

function hex(num) {
    return num.toString(16);
}

function init() {
    CHIP8_GRAPHICS.draw();
    drawMemory();
}