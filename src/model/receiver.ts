import { CronJob } from "cron";
import { COM, Status, StatusSender, TypeSender } from "../interfaces/reciver.interface";
import SendClient from "./sendClient";
import { SendServer } from "./sendServer";
import { Serial } from "./serial";
import sqlite from 'sqlite3';
import { Server as SocketIoServer } from 'socket.io';

import async from 'async';


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
        // type: TypeSender,
        ack: string,
        io: SocketIoServer,
        // * Serialport
        delimiter: string,
        options: COM,
        // Opcinales
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
                console.log('entro cron ' + this.id, new Date().getTime() - this.h1.getTime());
                if (new Date().getTime() - this.h1.getTime() > this.intervalHeart * 1000) {
                    console.log('fallo');
                    this.io.emit('data', 'se desconecto');
                    this.status = Status.error;
                } else {
                    this.status = Status.connect;
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

    close() {
        return new Promise<boolean>((resolve, reject) => {
            if(this.getPort.isOpen){
                this.getPort.close(err => {
                    if (err) {
                        return reject(err.message);
                    }
                    this.cronHeartbeat.stop();
                });
            }
            resolve(true);
        });
    }




    // * Sender
    createSender(typeSender: TypeSender, ip: string, port: number, status: StatusSender) {
        if (typeSender === TypeSender.withServer) {
            console.log('Server');
            this.sender = new SendServer(this.DB, this.id, port, status);
            if (status === StatusSender.start) this.sender.start();
        } else {
            console.log('Client');
            this.sender = new SendClient(this.DB, this.id, ip, port, status);
            if (status !== StatusSender.stop) this.sender.start();
        }
    }

    startSender() {
        if (this.sender) {
            this.sender.start();
        }
    }

    async stopSender() {
        try {
            if (this.sender) {
                await this.sender.stop();
                this.io.emit(`stopSender-${this.id}`);
            }
        } catch (error) {
            this.io.emit("error", error);
            console.log(error);
        }
    }

    deleteSender() {
        if (this.sender) {
            this.sender.stop();
            // ? Actualizar db
            this.typeSender = TypeSender.withOutServer;
            this.sender = null;
        }
    }



    delete() {
        if (this.sender?.getStatus === StatusSender.stop || this.sender === null) {
            return new Promise<boolean>((resolve, reject) => {
                this.DB.run(`DELETE FROM Receiver WHERE id="${this.id}"`,
                    async (err) => {
                        if (err) {
                            return reject(err.message)
                        }
                        this.DB.run(`DROP TABLE IF EXISTS ${this.id}`,
                            (err) => {
                                if (err) return reject(err.message);
                                this.cronHeartbeat.stop();
                                return resolve(true);
                            });
                    });
            });
        }
        return false;
    }

    open() {
        
        return new Promise<boolean>((resolve, reject) => {
            if(!this.getPort.isOpen){
                this.getPort.open((err) => {
                    if (err) {
                        this.status = Status.error;
                        return reject(err.message);
                    }
                    this.status = Status.connect;
                });
            }
            resolve(true);
        });
    }

    emit() {
        this.queue = async.queue(async (task, completed) => {
            // console.log(this.queue?.length() + '    ', task);
            if (this.queue?.length() === 0) {
                // TODO reset autoinvrement
                this.DB.run(`DELETE FROM sqlite_sequence WHERE name="${this.id}" `, (err) => {
                    err && console.log(err);
                });
            }
            try {
                if (this.sender) {

                    if (this.attempt < 3) {
                        // Emitir
                        this.sender.emit(task.event);
                        // Esperar ack
                        await this.sender.waitAck(this.intervalAck);
                        // Completar
                        this.DB.run(`DELETE FROM ${this.id} WHERE id=${task.id}`,
                            (err) => {
                                err && console.log(err);
                            });
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
                // TODO verificar tiempos
                setTimeout(() => {
                    if (this.queue) {
                        this.queue.unshift(task);
                        completed;
                    }
                }, 1000)
            }

        }, 1);
    }

    async init() {
        this.getPort.on('close', () => {
            this.status = Status.disconnect;
            console.log('Deconexión');

        });
        this.cronHeartbeat.start();
        this.io.on(`stopSender-${this.id}`, () => {
            this.stopSender();
        });
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
                if (err) {
                    return;
                }

                self.queue?.push({ id: this.lastID, event: event });
            });
    }

    load() {
        this.DB.all(`SELECT * FROM ${this.id}`, (err, rows: Array<Qevent>) => {
            if (err) {
                console.log(err);
                return;
            }
            rows.forEach(({ id, event }) => this.queue?.push({ id, event }));
        });
    }

    read() {
        this.getParser.on('data', (data: any) => {
            console.log(data.toString());
            this.h1 = new Date();
            if (!data.toString().includes(this.heartbeat)) {
                this.io.emit("data", {
                    id: this.id,
                    event: data.toString()
                });
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