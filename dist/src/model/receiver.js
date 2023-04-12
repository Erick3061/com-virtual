"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const reciver_interface_1 = require("../interfaces/reciver.interface");
const sendClient_1 = __importDefault(require("./sendClient"));
const sendServer_1 = require("./sendServer");
const serial_1 = require("./serial");
const async_1 = __importDefault(require("async"));
class Receiver extends serial_1.Serial {
    constructor(
    // * logica
    intervalHeart, DB, heartbeat, 
    // type: TypeSender,
    ack, io, 
    // * Serialport
    delimiter, options, 
    // Opcinales
    attempt = 0, intervalAck = 1000, status = reciver_interface_1.Status.disconnect, typeSender = reciver_interface_1.TypeSender.withOutServer) {
        const { baudRate, dataBits, highWaterMark, parity, path, rtsMode, rtscts, stopBits } = options;
        super(delimiter, baudRate, path, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits);
        this.sender = null;
        this.h1 = new Date();
        this.queue = null;
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
        this.cronHeartbeat = new cron_1.CronJob(`*/${this.intervalHeart} * * * * *`, () => {
            console.log('entro cron ' + this.id, new Date().getTime() - this.h1.getTime());
            if (new Date().getTime() - this.h1.getTime() > this.intervalHeart * 1000) {
                console.log('fallo');
                this.io.emit('data', 'se desconecto');
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
    get getStatus() {
        return this.status;
    }
    close() {
        return new Promise((resolve, reject) => {
            if (this.getPort.isOpen) {
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
        }
        catch (error) {
            this.io.emit("error", error);
            console.log(error);
        }
    }
    deleteSender() {
        if (this.sender) {
            this.sender.stop();
            // ? Actualizar db
            this.typeSender = reciver_interface_1.TypeSender.withOutServer;
            this.sender = null;
        }
    }
    delete() {
        if (this.sender?.getStatus === reciver_interface_1.StatusSender.stop || this.sender === null) {
            return new Promise((resolve, reject) => {
                this.DB.run(`DELETE FROM Receiver WHERE id="${this.id}"`, async (err) => {
                    if (err) {
                        return reject(err.message);
                    }
                    this.DB.run(`DROP TABLE IF EXISTS ${this.id}`, (err) => {
                        if (err)
                            return reject(err.message);
                        this.cronHeartbeat.stop();
                        return resolve(true);
                    });
                });
            });
        }
        return false;
    }
    open() {
        return new Promise((resolve, reject) => {
            if (!this.getPort.isOpen) {
                this.getPort.open((err) => {
                    if (err) {
                        this.status = reciver_interface_1.Status.error;
                        return reject(err.message);
                    }
                    this.status = reciver_interface_1.Status.connect;
                });
            }
            resolve(true);
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
        this.getPort.on('close', () => {
            this.status = reciver_interface_1.Status.disconnect;
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
    read() {
        this.getParser.on('data', (data) => {
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
        };
    }
}
exports.default = Receiver;
//# sourceMappingURL=receiver.js.map