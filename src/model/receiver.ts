import { AutoDetectTypes } from "@serialport/bindings-cpp";
import { DelimiterParser, SerialPort, SerialPortOpenOptions } from "serialport";
import SendClient from './sendClient';
import async from 'async';
import { CronJob } from 'cron';
import sqlite from 'sqlite3';
import path from 'path';
import { SendServer } from "./sendServer";
import { Status, StatusSender, TypeSender } from "../interfaces/reciver.interface";

interface Qevent {
    id: number;
    event: string;
}

export default class Receiver {

    private attempt: number;
    private sender: SendServer | SendClient | null = null;
    private cronHeartbeat: CronJob;
    private DB: sqlite.Database;
    private delimiter: string;
    private h1: Date = new Date();
    private heartbeat: string;
    private id: string;
    private intervalAck: number;
    private intervalHeart: number;
    private parser: any;
    private port: SerialPort;
    private queue: async.QueueObject<Qevent> | null = null;
    private status: Status = Status.disconnect;
    private type: TypeSender = TypeSender.withOutServer;
    private ack: string;


    constructor(id: string, options: SerialPortOpenOptions<AutoDetectTypes>, delimiter: string, intervalHeart: number, heartbeat: string, DB: sqlite.Database, type: TypeSender, ack: string, attemp: number = 0, intervalAck: number = 1000) {
        this.port = new SerialPort({ ...options, autoOpen: false });
        this.id = id;
        this.delimiter = delimiter;
        this.attempt = attemp;
        this.intervalHeart = intervalHeart;
        this.intervalAck = intervalAck;
        this.heartbeat = heartbeat;
        this.parser = this.port.pipe(new DelimiterParser({ delimiter: Buffer.from(this.delimiter, 'hex') }));
        this.DB = DB;
        this.type = type;
        this.ack = ack;
        this.cronHeartbeat = new CronJob(
            `*/${this.intervalHeart} * * * * *`,
            () => {
                console.log('entro cron ' + this.id, new Date().getTime() - this.h1.getTime());
                if (new Date().getTime() - this.h1.getTime() > this.intervalHeart * 1000) {
                    console.log('fallo');
                    // server.io.emit('error ${}', 'Fallo');
                    this.status = Status.error;
                } else {
                    this.status = Status.connect;
                }
            });
    }

    public get getId(): string {
        return this.id;
    }

    close() {
        // TODO actualizar en bd
        return new Promise<string>((resolve, reject) => {
            this.port.close(err => {
                if (err) {
                    console.log(err);

                    return reject(err.message);
                }
                // if (this.sender) this.sender.disconnect();
                resolve('algo');
            });
        });
    }

    private async createTable() {
        return new Promise<boolean>((resolve, reject) => {
            this.DB.run(
                `
                    CREATE TABLE IF NOT EXISTS ${this.id} (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)
                `
                , (err) => {
                    if (err) {
                        return reject(err.message);
                    }
                    resolve(true);
                });
        });
    }

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

    delete() {
        return new Promise<boolean>((resolve, reject) => {
            this.DB.run(`DROP TABLE ${this.id}`,
                (err) => {
                    if (err) {
                        return reject(err.message)
                    }
                    this.cronHeartbeat.stop();
                    this.sender = null;
                    return resolve(true);
                });
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
        try {
            this.port.on('close', () => this.status = Status.disconnect);
            await this.createTable();
            this.cronHeartbeat.start();
            this.emit();
            this.load();
            this.read();
        } catch (error) {
            console.log(error);
        }
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

    open() {
        return new Promise<boolean>((resolve, reject) => {
            this.port.open((err) => {
                if (err) return reject(err.message);

                resolve(true);
            });
        });
    }

    read() {
        this.parser.on('data', (data: any) => {
            console.log(data.toString());
            this.h1 = new Date();
            if (!data.toString().includes(this.heartbeat)) {
                this.insertData(data.toString());
            }
            this.port.write(Buffer.from(this.ack, 'hex'));
        });
    }
}
