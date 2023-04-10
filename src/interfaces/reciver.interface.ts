import { SerialPortOpenOptions } from 'serialport';
import { AutoDetectTypes } from '@serialport/bindings-cpp';

export enum Status {
    'connect' = 1,
    'disconnect' = 2,
    'error' = 3,
}

export enum TypeSender {
    'withOutServer' = 1,
    'withServer' = 2,
    'withClient' = 3,
}

export enum StatusSender {
    'start' = 1,
    'stop' = 2,
    'connecting' = 3,
}

export interface COM {
    baudRate: number;
    path: string;
    dataBits?: 5 | 6 | 7 | 8;
    highWaterMark?: number;
    parity?: "none" | "even" | "odd" | "mark" | "space";
    rtscts?: boolean;
    rtsMode?: "handshake" | "enable" | "toggle";
    stopBits?: 1 | 2 | 1.5;
}

export interface Receiver {
    com: COM;
    delimiter: string;
    status: Status;
    attempt: number;
    intervalAck: number;
    intervalHeart: number;
    heartbeat: string;
    ack: string;
}