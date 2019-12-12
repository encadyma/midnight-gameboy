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
        CHIP8.r.I = 0;
        CHIP8.r.PC = 0x200;

        V = new Uint8Array(new ArrayBuffer(16));
        prgm = new Uint16Array(prgmBuffer);

        for (let i = 0; i < prgm.length; i++) {
            CHIP8_MEM[i + 0x200] = prgm[i];
        }
    },

    // Performs an opcode operation
    do: function(op) {
        console.error("opcode not supported: " + op);
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

function init() {
    CHIP8_GRAPHICS.draw();
}