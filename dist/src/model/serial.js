"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
const serialport_1 = require("serialport");
class Serial {
    constructor(delimiter, baudRate, path, dataBits = 8, highWaterMark = 64000, parity = "none", rtscts = false, rtsMode = "handshake", stopBits = 1) {
        this.delimiter = delimiter;
        this.baudRate = baudRate;
        this.path = path;
        this.dataBits = dataBits;
        this.highWaterMark = highWaterMark;
        this.parity = parity;
        this.rtscts = rtscts;
        this.rtsMode = rtsMode;
        this.stopBits = stopBits;
        this.port = new serialport_1.SerialPort({
            path: this.path,
            baudRate: this.baudRate,
            dataBits: this.dataBits,
            highWaterMark: this.highWaterMark,
            parity: this.parity,
            rtscts: this.rtscts,
            rtsMode: this.rtsMode,
            stopBits: this.stopBits,
            autoOpen: false,
        });
        this.parser = this.port.pipe(new serialport_1.DelimiterParser({ delimiter: Buffer.from(this.delimiter, 'hex') }));
    }
    get getPort() {
        return this.port;
    }
    get getParser() {
        return this.parser;
    }
    get getDelimiter() {
        return this.delimiter;
    }
    get getBaudRate() {
        return this.baudRate;
    }
    get getPath() {
        return this.path;
    }
    get getDataBits() {
        return this.dataBits;
    }
    get getHighWaterMark() {
        return this.highWaterMark;
    }
    get getParity() {
        return this.parity;
    }
    get getRtscts() {
        return this.rtscts;
    }
    get getRtsMode() {
        return this.rtsMode;
    }
    get getStopBits() {
        return this.stopBits;
    }
    open() {
        return new Promise((resolve, reject) => {
            this.port.open((err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            });
        });
    }
}
exports.Serial = Serial;
//# sourceMappingURL=serial.js.map