import { DelimiterParser, SerialPort } from "serialport";

class Serial {
    private baudRate: number;
    private path: string;
    private dataBits: 5 | 6 | 7 | 8 | undefined;
    private highWaterMark: number | undefined;
    private parity: "none" | "even" | "odd" | "mark" | "space" | undefined;
    private rtscts: boolean;
    private rtsMode: "handshake" | "enable" | "toggle" | undefined;
    private stopBits: 1 | 2 | 1.5 | undefined;
    // Fuera de interfaz
    private port: SerialPort;
    private parser: any;
    private delimiter: string;



    constructor(
        baudRate: number,
        path: string,
        dataBits: 5 | 6 | 7 | 8 | undefined,
        highWaterMark: number | undefined,
        parity: "none" | "even" | "odd" | "mark" | "space" | undefined,
        rtscts: boolean,
        rtsMode: "handshake" | "enable" | "toggle" | undefined,
        stopBits: 1 | 2 | 1.5 | undefined,
        delimiter: string
    ) { 
        this.port = new SerialPort({ 
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
        this.parser = this.port.pipe(new DelimiterParser({ delimiter: Buffer.from(delimiter, 'hex') }));
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