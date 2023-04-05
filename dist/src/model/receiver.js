"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
const sendClient_1 = __importDefault(require("./sendClient"));
const async_1 = __importDefault(require("async"));
const cron_1 = require("cron");
const sendServer_1 = require("./sendServer");
const reciver_interface_1 = require("../interfaces/reciver.interface");
class Receiver {
    constructor(id, options, delimiter, intervalHeart, heartbeat, DB, type, ack, attemp = 0, intervalAck = 1000) {
        this.sender = null;
        this.h1 = new Date();
        this.queue = null;
        this.status = reciver_interface_1.Status.disconnect;
        this.type = reciver_interface_1.TypeSender.withOutServer;
        this.port = new serialport_1.SerialPort({ ...options, autoOpen: false });
        this.id = id;
        this.delimiter = delimiter;
        this.attempt = attemp;
        this.intervalHeart = intervalHeart;
        this.intervalAck = intervalAck;
        this.heartbeat = heartbeat;
        this.parser = this.port.pipe(new serialport_1.DelimiterParser({ delimiter: Buffer.from(this.delimiter, 'hex') }));
        this.DB = DB;
        this.type = type;
        this.ack = ack;
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
    close() {
        // TODO actualizar en bd
        return new Promise((resolve, reject) => {
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
    createSender(typeSender, ip, port, status) {
        if (typeSender === reciver_interface_1.TypeSender.withServer) {
            console.log('Server');
            this.sender = new sendServer_1.SendServer(this.DB, this.id, port, status);
            if (status === reciver_interface_1.StatusSender.start)
                this.sender.start();
        }
        else {
            console.log('Client');
            this.sender = new sendClient_1.default(this.DB, this.id, ip, port, status);
            if (status !== reciver_interface_1.StatusSender.stop)
                this.sender.start();
        }
    }
    delete() {
        return new Promise((resolve, reject) => {
            this.DB.run(`DROP TABLE ${this.id}`, (err) => {
                if (err) {
                    return reject(err.message);
                }
                this.cronHeartbeat.stop();
                this.sender = null;
                return resolve(true);
            });
        });
    }
    emit() {
        this.queue = async_1.default.queue(async (task, completed) => {
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
                        this.DB.run(`DELETE FROM ${this.id} WHERE id=${task.id}`, (err) => {
                            err && console.log(err);
                        });
                        completed;
                    }
                    else {
                        if (this.sender.isValid()) {
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
                        completed;
                    }
                }, 1000);
            }
        }, 1);
    }
    async init() {
        try {
            this.port.on('close', () => this.status = reciver_interface_1.Status.disconnect);
            await this.createTable();
            this.cronHeartbeat.start();
            this.emit();
            this.load();
            this.read();
        }
        catch (error) {
            console.log(error);
        }
    }
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
    load() {
        this.DB.all(`SELECT * FROM ${this.id}`, (err, rows) => {
            if (err) {
                console.log(err);
                return;
            }
            rows.forEach(({ id, event }) => this.queue?.push({ id, event }));
        });
    }
    open() {
        return new Promise((resolve, reject) => {
            this.port.open((err) => {
                if (err)
                    return reject(err.message);
                resolve(true);
            });
        });
    }
    read() {
        this.parser.on('data', (data) => {
            console.log(data.toString());
            this.h1 = new Date();
            if (!data.toString().includes(this.heartbeat)) {
                this.insertData(data.toString());
            }
            this.port.write(Buffer.from(this.ack, 'hex'));
        });
    }
}
exports.default = Receiver;
//# sourceMappingURL=receiver.js.map