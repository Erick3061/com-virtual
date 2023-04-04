import { AutoDetectTypes } from "@serialport/bindings-cpp";
import { DelimiterParser, SerialPort, SerialPortOpenOptions } from "serialport";
import sendClient, { Status as StatusClient } from './sendClient';
import async from 'async';
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

    private port: SerialPort;
    private parser: any;
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

    constructor(id: string, options: SerialPortOpenOptions<AutoDetectTypes>, delimiter: string, intervalHeart: number, heartbeat: string, attemp: number = 0, intervalAck: number = 1000) {
        this.port = new SerialPort({ ...options, autoOpen: false });
        this.id = id;
        this.delimiter = delimiter;
        this.attempt = attemp;
        this.intervalHeart = intervalHeart;
        this.intervalAck = intervalAck;
        this.heartbeat = heartbeat;
        this.parser = this.port.pipe(new DelimiterParser({ delimiter: Buffer.from(this.delimiter, 'hex') }));
        this.DB = new sqlite.Database(path.join(__dirname, 'db.db'),
            (err) => {
                if (err) {
                    console.log(`Fallo al crear la base de datos ${err}`);
                    return;
                }
                // this.DB.run('DROP TABLE Data');
                this.DB.run(
                    `
                    CREATE TABLE IF NOT EXISTS ${this.id} (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)
                    `
                    , (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    })
            });
        this.init();
    }


    public get getId(): string {
        return this.id;
    }


    private init() {
        this.port.on('close', () => this.status = Status.disconnect);
        const cron = new CronJob(
            `*/${this.intervalHeart} * * * * *`,
            () => {
                console.log('entro cron', new Date().getTime() - this.h1.getTime());
                if (new Date().getTime() - this.h1.getTime() > this.intervalHeart * 1000) {
                    console.log('fallo');
                    // server.io.emit('error ${}', 'Fallo');
                    this.status = Status.error;
                } else {
                    this.status = Status.connect;
                }
            },
        );
        cron.start();
    }

    open() {
        return new Promise<string>((resolve, reject) => {
            this.port.open((err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve('');
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
            this.port.write(Buffer.from('06', 'hex'));
        });
    }

    close() {
        return new Promise<string>((resolve, reject) => {
            this.port.close(err => {
                if (err) {
                    console.log(err);

                    return reject(err.message);
                }
                // if (this.clentClient) this.clentClient.disconnect();
                resolve('algo');
            });
        });
    }

    load() {
        // // if (this.queue) {
        // //     console.log('existe queue');
        // //     // this.queue.pushAsync('Erick');
        // // }
        // const data = [
        //     "S01001[#9993 | Nri1 / MA0000 / MH0000]",
        //     "001000[#0000 | NYC0101]",
        //     "001000[#0000 | NSC0000]",
        //     "001000[#0000 | NYK0101]",
        //     "001000[#0000 | NSC0003]",
        // ];
        // // Cargar datos de DB y meterlos a la cola

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
        this.clentClient = new SendServer(2020);
        this.clentClient.start();
        // this.clentClient = new sendClient('127.0.0.1', 9292, 1);
        // this.clentClient.connect();
    }

    emit() {
        this.queue = async.queue(async (task, completed) => {
            console.log(this.queue?.length() + '    ', task);
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
}
