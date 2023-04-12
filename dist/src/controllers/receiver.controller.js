"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receivers = void 0;
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const receiver_1 = __importDefault(require("../model/receiver"));
const reciver_interface_1 = require("../interfaces/reciver.interface");
class Receivers {
    constructor(io) {
        this.receivers = [];
        const dir = path_1.default.join(__dirname, '../../../db');
        this.io = io;
        this.db = new sqlite3_1.default.Database(path_1.default.join(dir, 'db.db'), (err) => {
            if (err) {
                this.io.emit("sdgjh");
                console.log(`Fallo al crear la base de datos ${err}`);
                return;
            }
            this.load();
        });
    }
    static getInstance(io) {
        if (!Receivers.instance) {
            Receivers.instance = new Receivers(io);
        }
        return Receivers.instance;
    }
    // ********************************
    load() {
        this.db.all(`SELECT * FROM Receiver`, async (err, rows) => {
            if (err) {
                try {
                    await this.crateReceiver();
                    return;
                }
                catch (error) {
                    console.log(error);
                }
            }
            await Promise.all(rows.map(async (receiver) => {
                const { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status, typeSender, ip, port, senderStatus } = receiver;
                const com = { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode };
                const rv = new receiver_1.default(intervalHeart, this.db, heartbeat, ack, this.io, delimiter, com, attempt, intervalAck, status, typeSender);
                try {
                    if (status === reciver_interface_1.Status.disconnect) {
                        return true;
                    }
                    // TODO
                    if (typeSender !== reciver_interface_1.TypeSender.withOutServer) {
                        rv.createSender(typeSender, ip, port, senderStatus);
                    }
                    await rv.open();
                    // TODO Verificar la existencia de la tabla para sus eventos
                    // await this.createTableEventReceiver(rv.getId);
                    await rv.init();
                    return true;
                }
                catch (error) {
                    console.log(error);
                }
                finally {
                    this.receivers = [...this.receivers, rv];
                }
            }));
        });
    }
    // ********************************
    async newReciver(data) {
        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart } = data;
        const id = com.path.replaceAll('/', '');
        if (this.receivers.some(rv => rv.getId === id)) {
            return 'Puerto serial en uso';
        }
        const rv = new receiver_1.default(intervalHeart, this.db, heartbeat, ack, this.io, delimiter, com, attempt, intervalAck);
        try {
            await rv.open();
            await this.save(rv.getId, data);
            await rv.init();
            this.receivers = [...this.receivers, rv];
            return rv;
        }
        catch (error) {
            await rv.close();
            return `${error}`;
        }
    }
    // ********************************
    async stopReceiver(id) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            throw 'Receiver with ID not exist';
        }
        await rv.close();
        await this.updateState(id, reciver_interface_1.Status.disconnect);
    }
    // ******************************
    async startReceiver(id) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            throw 'Receiver with ID not exist';
        }
        await rv.open();
        await rv.init();
        await this.updateState(id, reciver_interface_1.Status.connect);
    }
    // *******************************
    async removeReciver(id) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            return 'Receiver with ID not exist';
        }
        //TODO
        await rv.close();
        await rv.delete();
        this.receivers = this.receivers.filter(rv => rv.getId != id);
    }
    getAll() {
        return this.receivers.map(rv => rv.getInformation());
    }
    stopSenderReciver(id) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            return 'Receiver with ID not exist';
        }
    }
    // * DB
    async save(id, data) {
        try {
            await this.saveRV(id, data);
            await this.createTableEventReceiver(id);
            return true;
        }
        catch (error) {
            await this.deleteDB(id);
            if (typeof error === "string") {
                throw error;
            }
            throw 'Error no controlado';
        }
    }
    async saveRV(id, data) {
        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart } = data;
        const { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode } = com;
        return new Promise((resolve, reject) => {
            this.db.run(`
                    INSERT INTO Receiver (
                        id, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, baudRate, path, typeSender, status, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits
                    ) VALUES (
                        "${id}", "${ack}", ${attempt}, "${delimiter}", "${heartbeat}", ${intervalAck}, ${intervalHeart}, ${baudRate}, "${path}", ${reciver_interface_1.TypeSender.withOutServer}, ${reciver_interface_1.Status.connect}, ${dataBits}, ${highWaterMark}, "${parity}", ${rtscts}, "${rtsMode}", ${stopBits}
                    );
                `, (err) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(true);
            });
        });
    }
    async createTableEventReceiver(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                    CREATE TABLE IF NOT EXISTS ${id} (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)
                `, (err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            });
        });
    }
    updateState(id, state) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE Receiver set status = ${state} WHERE id = "${id}"`, (err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            });
        });
    }
    deleteDB(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                    DELETE FROM Receiver where id = "${id}"
                `, (err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            });
        });
    }
    crateReceiver() {
        return new Promise((resolve, reject) => {
            this.db.run(`
                    CREATE TABLE IF NOT EXISTS Receiver (
                        id TEXT PRIMARY KEY,
                        ack TEXT,
                        attempt INTEGER,
                        delimiter TEXT,
                        heartbeat TEXT,
                        intervalAck INTEGER,
                        intervalHeart INTEGER,
                        status INTEGER,
                        typeSender INTEGER,
                        baudRate INTEGER,
                        path TEXT,
                        dataBits INTEGER,
                        highWaterMark INTEGER,
                        parity TEXT,
                        rtscts BOOLEAN,
                        rtsMode TEXT,
                        stopBits DOUBLE,
                        ip TEXT,
                        port INTEGER,
                        senderStatus INTEFER
                    )
                    `, (err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            });
        });
    }
}
exports.Receivers = Receivers;
//# sourceMappingURL=receiver.controller.js.map