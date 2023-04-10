import { SerialPort, DelimiterParser } from 'serialport';

export class Serial {

    private port: SerialPort;
    private parser: any;

    private delimiter: string;
    private baudRate: number;
    private path: string;
    private dataBits: 5 | 6 | 7 | 8;
    private highWaterMark: number;
    private parity: "none" | "even" | "odd" | "mark" | "space";
    private rtscts: boolean;
    private rtsMode: "handshake" | "enable" | "toggle";
    private stopBits: 1 | 2 | 1.5;


    constructor(
        delimiter: string,
        baudRate: number,
        path: string,
        dataBits: 5 | 6 | 7 | 8 = 8,
        highWaterMark: number = 64000,
        parity: "none" | "even" | "odd" | "mark" | "space" = "none",
        rtscts: boolean = false,
        rtsMode: "handshake" | "enable" | "toggle" = "handshake",
        stopBits: 1 | 2 | 1.5 = 1,
    ) {

        this.delimiter = delimiter;
        this.baudRate = baudRate;
        this.path = path;
        this.dataBits = dataBits;
        this.highWaterMark = highWaterMark;
        this.parity = parity;
        this.rtscts = rtscts;
        this.rtsMode = rtsMode;
        this.stopBits = stopBits;

        this.port = new SerialPort({
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
        this.parser = this.port.pipe(new DelimiterParser({ delimiter: Buffer.from(this.delimiter, 'hex') }));
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
        return new Promise<boolean>((resolve, reject) => {
            this.port.open((err) => {
                if (err) {

                    return reject(err.message);
                }

                resolve(true);
            });
        });
    }

}