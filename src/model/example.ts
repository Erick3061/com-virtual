import { AutoDetectTypes } from "@serialport/bindings-cpp";
import { DelimiterParser, SerialPort, SerialPortOpenOptions } from "serialport";
import sendClient from './sendClient';
import async, { timeout } from 'async';
import { CronJob } from 'cron';
import sqlite from 'sqlite3';
import path from 'path';
import { SendServer } from "./sendServer";
import { Status } from "../interfaces/reciver.interface";

interface Qevent {
    id: number;
    event: string;
}

export default class Receiver {

    private delimiter: string;
    private status: Status = Status.disconnect;
    private clentClient: SendServer | sendClient | null = null;
    // private clentServer: SendServer | null = null;
    private queue: async.QueueObject<Qevent> | null = null;
    private attempt: number;
    private intervalAck: number;
    private intervalHeart: number;
    // private lastindex: number = 0;
    private heartbeat: string;
    private DB: sqlite.Database;
    private id: string;

    private h1: Date = new Date();

    private cronHeartbeat: CronJob;

    constructor(id: string, options: SerialPortOpenOptions<AutoDetectTypes>, delimiter: string, intervalHeart: number, heartbeat: string, DB: sqlite.Database, attemp: number = 0, intervalAck: number = 1000) {
        this.id = id;
        this.delimiter = delimiter;
        this.attempt = attemp;
        this.intervalHeart = intervalHeart;
        this.intervalAck = intervalAck;
        this.heartbeat = heartbeat;
        this.DB = DB;
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


    async init() {
        try {
            await this.createTable();
            this.cronHeartbeat.start();
        } catch (error) {
            console.log(error);
        }
    }

    open() {
        return new Promise<boolean>((resolve, reject) => {
            if (this.id === '') return reject(`Error en ${this.id}`);
            this.emit();
            this.load();
            this.read();
            resolve(true);
        })
    }

    read() {

        const cron = new CronJob(
            `*/15 * * * * *`,
            () => {
                this.h1 = new Date();
                this.insertData(new Date().toString());

            },
        );
        cron.start();

    }

    close() {
        return true;
    }

    load() {

        // data.forEach((dt, idx) => this.queue?.push({ id: idx, event: dt }));
        this.DB.all(`SELECT * FROM ${this.id}`, (err, rows: Array<Qevent>) => {
            if (err) {
                console.log(err);
                return;
            }

            rows.forEach(({ id, event }) => this.queue?.push({ id, event }));

        });
    }

    createSender() {
        this.clentClient = new SendServer(this.DB, this.id, 2020);
        this.clentClient.start();
        // this.clentClient = new sendClient('127.0.0.1', 9292, 1);
        // this.clentClient.connect();
    }

    emit() {
        this.queue = async.queue(async (task, completed) => {

            if (this.queue?.length() === 0) {
                // TODO reset autoinvrement
                this.DB.run(`DELETE FROM sqlite_sequence WHERE name="${this.id}" `, (err) => {
                    err && console.log(err);
                });
            }
            try {
                if (this.clentClient) {

                    if (this.attempt < 3) {
                        // Emitir
                        this.clentClient.emit(task.event);
                        // Esperar ack
                        await this.clentClient.waitAck(this.intervalAck);
                        // Completar
                        this.DB.run(`DELETE FROM ${this.id} WHERE id=${task.id}`,
                            (err) => {
                                err && console.log(err);
                            });
                        completed(null);
                    } else {
                        if (this.clentClient.isValid()) {
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
                        completed(null);
                    }
                }, 1000)
            }

        }, 1);
    }
    ///Metodos db
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

    delete() {
        return new Promise<boolean>((resolve, reject) => {
            this.DB.run(`DROP TABLE ${this.id}`,
                (err) => {
                    if (err) {
                        return reject(err.message)
                    }
                    this.cronHeartbeat.stop();
                    this.clentClient = null;
                    return resolve(true);
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
}
