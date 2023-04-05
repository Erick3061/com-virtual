"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
class Receiver {
    constructor(options, delimiter) {
        this.port = new serialport_1.SerialPort(Object.assign({}, options));
        this.delimiter = delimiter;
        this.parser = this.port.pipe(new serialport_1.DelimiterParser({ delimiter: Buffer.from(delimiter, 'hex') }));
    }
    open() {
        return new Promise((resolve, reject) => {
            this.port.open((err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve('opopo');
            });
        });
    }
    read() {
        this.parser.on('data', (data) => {
            console.log(data.toString());
            this.port.write(Buffer.from('06', 'hex'));
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.port.close(err => {
                if (err) {
                    return reject(err.message);
                }
                resolve('algo');
            });
        });
    }
}
exports.default = Receiver;
//# sourceMappingURL=model.js.map