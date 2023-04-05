"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_1 = __importDefault(require("async"));
const cron_1 = require("cron");
const sendServer_1 = require("./sendServer");
const reciver_interface_1 = require("../interfaces/reciver.interface");
class Receiver {
    constructor(id, options, delimiter, intervalHeart, heartbeat, DB, attemp = 0, intervalAck = 1000) {
        this.status = reciver_interface_1.Status.disconnect;
        this.clentClient = null;
        // private clentServer: SendServer | null = null;
        this.queue = null;
        this.h1 = new Date();
        this.id = id;
        this.delimiter = delimiter;
        this.attempt = attemp;
        this.intervalHeart = intervalHeart;
        this.intervalAck = intervalAck;
        this.heartbeat = heartbeat;
        this.DB = DB;
        this.cronHeartbeat = new cron_1.CronJob(`*/${this.intervalHeart} * * * * *`, () => {
            console.log('entro cron ' + this.id, new Date().getTime() - this.h1.getTime());
            if (new Date().getTime() - this.h1.getTime() > this.intervalHeart * 1000) {
                console.log('fallo');
                // server.io.emit('error ${}', 'Fallo');
                this.status = reciver_interface_1.Status.error;
            }
            else {
                this.status = reciver_interface_1.Status.connect;
            }
        });
    }
    get getId() {
        return this.id;
    }
    async init() {
        try {
            await this.createTable();
            this.cronHeartbeat.start();
        }
        catch (error) {
            console.log(error);
        }
    }
    open() {
        return new Promise((resolve, reject) => {
            if (this.id === '')
                return reject(`Error en ${this.id}`);
            this.emit();
            this.load();
            this.read();
            resolve(true);
        });
    }
    read() {
        const cron = new cron_1.CronJob(`*/15 * * * * *`, () => {
            this.h1 = new Date();
            this.insertData(new Date().toString());
        });
        cron.start();
    }
    close() {
        return true;
    }
    load() {
        // data.forEach((dt, idx) => this.queue?.push({ id: idx, event: dt }));
        this.DB.all(`SELECT * FROM ${this.id}`, (err, rows) => {
            if (err) {
                console.log(err);
                return;
            }
            rows.forEach(({ id, event }) => this.queue?.push({ id, event }));
        });
    }
    createSender() {
        this.clentClient = new sendServer_1.SendServer(this.DB, this.id, 2020);
        this.clentClient.start();
        // this.clentClient = new sendClient('127.0.0.1', 9292, 1);
        // this.clentClient.connect();
    }
    emit() {
        this.queue = async_1.default.queue(async (task, completed) => {
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
                        this.DB.run(`DELETE FROM ${this.id} WHERE id=${task.id}`, (err) => {
                            err && console.log(err);
                        });
                        completed(null);
                    }
                    else {
                        if (this.clentClient.isValid()) {
                            this.attempt = 0;
                        }
                        throw '';
                    }
                }
            }
            catch (err) {
                this.attempt++;
                // TODO verificar tiempos
                setTimeout(() => {
                    if (this.queue) {
                        this.queue.unshift(task);
                        completed(null);
                    }
                }, 1000);
            }
        }, 1);
    }
    ///Metodos db
    insertData(event) {
        const self = this;
        this.DB.run(`
            INSERT INTO ${this.id} (event) VALUES ("${event}");
        `, function (err) {
            if (err) {
                return;
            }
            self.queue?.push({ id: this.lastID, event: event });
        });
    }
    delete() {
        return new Promise((resolve, reject) => {
            this.DB.run(`DROP TABLE ${this.id}`, (err) => {
                if (err) {
                    return reject(err.message);
                }
                this.cronHeartbeat.stop();
                this.clentClient = null;
                return resolve(true);
            });
        });
    }
    async createTable() {
        return new Promise((resolve, reject) => {
            this.DB.run(`
                    CREATE TABLE IF NOT EXISTS ${this.id} (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)
                `, (err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            });
        });
    }
}
exports.default = Receiver;
//# sourceMappingURL=example.js.map