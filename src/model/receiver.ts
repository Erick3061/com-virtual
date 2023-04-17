import { CronJob } from "cron";
import { COM, Status, StatusSender, TypeSender } from "../interfaces/reciver.interface";
import SendClient from "./sendClient";
import { SendServer } from "./sendServer";
import { Serial } from "./serial";
import sqlite from 'sqlite3';
import { Server as SocketIoServer } from 'socket.io';

import async from 'async';
import { log } from "console";

interface Qevent {
    id: number;
    event: string;
}

export default class Receiver extends Serial {

    private attempt: number;
    private sender: SendServer | SendClient | null = null;
    private cronHeartbeat: CronJob;
    private DB: sqlite.Database;
    private h1: Date = new Date();
    private heartbeat: string;
    private id: string;
    private intervalAck: number;
    private intervalHeart: number;
    private queue: async.QueueObject<Qevent> | null = null;
    private status: Status;
    private typeSender: TypeSender;
    private ack: string;
    private io: SocketIoServer;

    constructor(
        // * logica
        intervalHeart: number,
        DB: sqlite.Database,
        heartbeat: string,
        ack: string,
        io: SocketIoServer,
        // * Serialport
        delimiter: string,
        options: COM,
        // * Opcinales
        attempt: number = 0,
        intervalAck: number = 1000,
        status: Status = Status.disconnect,
        typeSender: TypeSender = TypeSender.withOutServer
    ) {
        const { baudRate, dataBits, highWaterMark, parity, path, rtsMode, rtscts, stopBits } = options;
        super(delimiter, baudRate, path, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits);
        this.id = path.replaceAll('/', '');
        this.attempt = attempt;
        this.intervalHeart = intervalHeart;
        this.DB = DB;
        this.heartbeat = heartbeat;
        this.intervalAck = intervalAck;
        this.typeSender = typeSender;
        this.ack = ack;
        this.io = io;
        this.status = status;

        this.cronHeartbeat = new CronJob(
            `*/${this.intervalHeart} * * * * *`,
            () => {
                if (new Date().getTime() - this.h1.getTime() > this.intervalHeart * 1000) {
                    //* Status message 1:Success, 2:warning, 3:Error
                    this.status = Status.warning;
                    this.io.emit(`status-${this.id}`, {
                        msg: `Posible desconexión Heartbeat`,
                        status: this.status
                    });
                } else {
                    if (this.status !== Status.connect) {
                        this.status = Status.connect;
                        this.io.emit(`status-${this.id}`, {
                            msg: `Conexión restablecida`,
                            status: this.status
                        });
                    }
                }
            }
        );

    }


    public get getId(): string {
        return this.id;
    }
    public get getStatus() {
        return this.status;
    }
    public get getTypeSender() {
        return this.typeSender;
    }
    get getSender() {
        return this.sender;
    }

    close() {
        return new Promise<boolean>((resolve, reject) => {
            if (this.getPort.isOpen) {
                this.getPort.close(err => {
                    if (err) return reject(err.message);
                    this.cronHeartbeat.stop();
                    resolve(true);
                });
            } else {
                reject("Port is closed");
            }
        });
    }

    // * Sender
    createSender(typeSender: TypeSender, ip: string, port: number, status: StatusSender) {
        if (typeSender === TypeSender.withServer) {
            this.typeSender = typeSender;
            this.sender = new SendServer(this.io, this.DB, this.id, port, status);
        } else {
            this.typeSender = typeSender;
            this.sender = new SendClient(this.io, this.DB, this.id, ip, port, status);
        }
        if (status !== StatusSender.stop) this.sender.start();
    }

    async stopSender(isDelete: boolean = false, deleteAll: boolean = false) {
        if (this.sender) {
            if (this.sender.getStatus !== StatusSender.stop) {
                return await this.sender.stop();
            }
            if (isDelete) return;
            throw 'Sender is stop';
        }
        if (deleteAll) return;
        throw 'Not sender';
    }

    resetSender() {
        this.sender = null;
    }

    startSender() {
        if (this.sender) {
            if (this.sender.getStatus === StatusSender.stop) {
                this.sender.start();
                return;
            }
            throw 'Server is start';
        }
        throw 'Not sender';
    }

    deleteSender() {
        if (this.sender) {
            this.sender.stop();
            this.typeSender = TypeSender.withOutServer;
            this.sender = null;
        }
    }

    open() {
        return new Promise<boolean>((resolve, reject) => {
            if (!this.getPort.isOpen) {

                this.getPort.open((err) => {
                    if (err) {
                        this.status = Status.error;
                        return reject(err.message);
                    }
                    this.status = Status.connect;
                    resolve(true);
                });
            } else {
                reject('Port is open');
            }
        });
    }

    emit() {
        this.queue = async.queue(async (task, completed) => {
            if (this.queue?.length() === 0) {
                this.DB.run(`DELETE FROM sqlite_sequence WHERE name="${this.id}" `);
            }
            try {
                if (this.sender) {

                    if (this.attempt < 3) {
                        // Emitir
                        this.sender.emit(task.event);
                        // Esperar ack
                        await this.sender.waitAck(this.intervalAck);
                        // Completar
                        this.DB.run(`DELETE FROM ${this.id} WHERE id=${task.id}`);
                        completed;
                    } else {
                        if (this.sender.isValid()) {
                            this.attempt = 0;
                        }
                        throw '';
                    }
                }
            } catch (err) {
                this.attempt++;
                setTimeout(() => {
                    if (this.queue) {
                        this.queue.unshift(task);
                        completed;
                    }
                }, 1000)
            }

        }, 1);
    }

    init() {
        this.getPort.on('close', () => {
            this.status = Status.disconnect;
            this.io.emit(`status-${this.id}`, {
                msg: 'Receiver disconnected',
                status: this.status
            });
        });
        this.cronHeartbeat.start();
        this.h1 = new Date();
        this.emit();
        this.load();
        this.read();

    }

    insertData(event: string) {
        const self = this;
        this.DB.run(`
            INSERT INTO ${this.id} (event) VALUES ("${event}");
        `,
            function (this, err) {
                if (err) return;
                self.queue?.push({ id: this.lastID, event: event });
            });
    }

    load() {
        this.DB.all(`SELECT * FROM ${this.id}`, (err, rows: Array<Qevent>) => {
            if (err) {
                this.io.emit(`error-${this.id}`, 'No se obtuvo data de la DB');
                return;
            }
            rows.forEach(({ id, event }) => this.queue?.push({ id, event }));
        });
    }

    read() {
        this.getParser.on('data', (data: Buffer) => {
            this.h1 = new Date();
            if (!data.toString().includes(this.heartbeat)) {
                this.io.emit(`event-${this.id}`, data.toString());
                this.insertData(data.toString());
            }
            this.getPort.write(Buffer.from(this.ack, 'hex'));
        });
    }

    getInformation() {
        return {
            attempt: this.attempt,
            delimiter: this.getDelimiter,
            heartbeat: this.heartbeat,
            id: this.id,
            intervalAck: this.intervalAck,
            intervalHeart: this.intervalHeart,
            status: this.status,
            typeSender: this.typeSender,
            ack: this.ack,
            baudRate: this.getBaudRate,
            path: this.getPath,
            dataBits: this.getDataBits,
            highWaterMark: this.getHighWaterMark,
            parity: this.getParity,
            rtscts: this.getRtscts,
            rtsMode: this.getRtsMode,
            stopBits: this.getStopBits,
            ip: this.sender?.getIp || '',
            port: this.sender?.getPort || '',
            statusSender: this.sender?.getStatus || '',
        }
    }

}