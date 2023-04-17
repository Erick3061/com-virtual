export interface COM {
    baudRate: number;
    path: string;
    dataBits?: 5 | 6 | 7 | 8;
    highWaterMark?: number;
    parity?: "none" | "even" | "odd" | "mark" | "space";
    rtscts?: boolean;
    rtsMode?: "handshake" | "enable" | "toggle";
    stopBits?: 1 | 2 | 1.5 | number;
}

export interface ReceiverPost {
    com: COM;
    delimiter: string;
    attempt: number;
    intervalAck: number;
    intervalHeart: number;
    heartbeat: string;
    ack: string;
}

export interface ResponseReceiver {
    attempt: number;
    delimiter: string;
    heartbeat: string;
    id: string;
    intervalAck: number;
    intervalHeart: number;
    status: number;
    typeSender: number;
    ack: string;
    baudRate: number;
    path: string;
    dataBits: number;
    highWaterMark: number;
    parity: string;
    rtscts: number;
    rtsMode: string;
    stopBits: number;
    ip: string;
    port: number;
    statusSender: number;
}
