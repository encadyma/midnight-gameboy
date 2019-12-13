CODES = {
    unknown: { name: (op) => hex(op) + '????', color: '#ff0000' },

    // 0x0 operations:
    dispclear: { name: (op) => 'CLS', color: '#badc58' },
    return: { name: (op) => 'RETURN', color: '#9b59b6' },
    
    // Regular operations:
    jump: { name: (op) => 'JUMP ' + fhex(op & 0xfff), color: '#1abc9c' },
    call: { name: (op) => 'CALL ' + fhex(op & 0xfff), color: '#9b59b6' },
    eq: { name: (op) => `EQ V${hex((op >> 2) & 0xf)}, ${fhex(op & 0xff)}`, color: '#3B3B98' },
    neq: { name: (op) => `NEQ V${hex((op >> 2) & 0xf)}, ${fhex(op & 0xff)}`, color: '#6D214F' },
    eqReg: { name: (op) => `EQR V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#3B3B98' },
    neqReg: { name: (op) => `NEQR V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#6D214F' },
    loadToReg: { name: (op) => `SET V${hex((op >> 2) & 0xf)}, ${fhex(op & 0xff)}`, color: '#9AECDB' },
    addToReg: { name: (op) => `AREG V${hex((op >> 2) & 0xf)}, ${fhex(op & 0xff)}`, color: '#9AECDB' },
    setI: { name: (op) => 'SETI ' + fhex(op & 0xfff), color: '#CAD3C8' },
    jumpV: { name: (op) => 'JUMPV ' + fhex(op & 0xfff), color: '#1abc9c' },
    setRand: { name: (op) => `SETRND V${hex((op >> 2) & 0xf)}, ${fhex(op & 0xff)}`, color: '#BDC581' },
    draw: { name: (op) => `DRAW V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}, ${hex(op & 0xf)}`, color: '#badc58' },

    // 0x8 operations:
    copyReg: { name: (op) => `SET V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    or: { name: (op) => `OR V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    and: { name: (op) => `AND V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    xor: { name: (op) => `XOR V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    add: { name: (op) => `ADD V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    sub: { name: (op) => `SUB V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    rightShift: { name: (op) => `RSHFT V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    leftShift: { name: (op) => `LSHFT V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },
    subInv: { name: (op) => `SUBX V${hex((op >> 2) & 0xf)}, V${hex((op >> 1) & 0xf)}`, color: '#FC427B' },

    // 0xF operations:
    getDelay: { name: (op) => `GETTD V${hex((op >> 2) & 0xf)}`, color: '#130f40' },
    setDelay: { name: (op) => `SETTD V${hex((op >> 2) & 0xf)}`, color: '#130f40' },
    setSound: { name: (op) => `SETTS V${hex((op >> 2) & 0xf)}`, color: '#130f40' },
    addI: { name: (op) => `ADDI V${hex((op >> 2) & 0xf)}`, color: '#130f40' },
    decimalize: { name: (op) => `DCML V${hex((op >> 2) & 0xf)}`, color: '#130f40' },
    dumpReg: { name: (op) => `DUMP V0, V${hex((op >> 2) & 0xf)}`, color: '#130f40' },
    restoreReg: { name: (op) => `RSTR V0, V${hex((op >> 2) & 0xf)}`, color: '#130f40' },
}

function hex(num) {
    return num.toString(16);
}

function fhex(num) {
    return '0x' + num.toString(16);
}