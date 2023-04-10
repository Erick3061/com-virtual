"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
class Serial {
    constructor(baudRate, path, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits, delimiter) {
        this.port = new serialport_1.SerialPort({
            baudRate: baudRate,
            path: path,
            dataBits: dataBits,
            highWaterMark: highWaterMark,
            parity: parity,
            rtscts: rtscts,
            rtsMode: rtsMode,
            stopBits: stopBits,
            autoOpen: false
        });
        this.parser = this.port.pipe(new serialport_1.DelimiterParser({ delimiter: Buffer.from(delimiter, 'hex') }));
        this.delimiter = delimiter;
        this.baudRate = baudRate;
        this.path = path;
        this.dataBits = dataBits;
        this.highWaterMark = highWaterMark;
        this.parity = parity;
        this.rtscts = rtscts;
        this.rtsMode = rtsMode;
        this.stopBits = stopBits;
    }
}
//# sourceMappingURL=serialPort.js.map