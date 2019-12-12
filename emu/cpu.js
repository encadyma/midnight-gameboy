// Zilog Z80.
// 8-bit chip (1 byte at a time)
// 16-bit address bus
// Programs accessed through same bus as normal memory
// Instructions range from one-three bytes

// The state of the Z80.

Z80 = {
    // REGISTERS: Registers, each
    // holding one byte. Used for calculation.
    // There are other special registers,
    // such as F(L) (flags register) and
    // the SP (stack pointer)
    r: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        H: 0,
        L: 0,

        // SPECIAL REGISTERS
        // FLAG (F/FL): Four possible flags.
        FL: 0,

        // PROGRAM COUNTER: a counter
        // that advances each time by
        // the number of bytes per instruction ran.
        PC: 0,

        // STACK POINTER
        SP: 0,

        // PREVIOUS CLOCK
        M: 0,
        T: 0,
    },

    // Current clock for the Z80
    // 1 Machine Cycle = 4 Clock Cycles
    clock: {
        M: 0,       // Machine cycles
        T: 0,       // Clock cycles
    },

    // OPCODE IMPLEMENTATIONS:
    // This will be a very long file!

    NOP: function() {
        // Takes 1 M-time
        CPU.r.M = 1; CPU.r.T = 4;
    },

    NOIMP: function(op) {
        // Does nothing.
        console.log("No implementation: " + op)
    },
}