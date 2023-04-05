"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receivers = void 0;
const reciver_interface_1 = require("../interfaces/reciver.interface");
const receiver_1 = __importDefault(require("./receiver"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
class Receivers {
    constructor() {
        this.receivers = [];
        const dir = path_1.default.join(__dirname, '../../../db');
        this.db = new sqlite3_1.default.Database(path_1.default.join(dir, 'db.db'), (err) => {
            if (err) {
                console.log(`Fallo al crear la base de datos ${err}`);
                return;
            }
            // this.db.run('drop table Receiver')
            // this.db.run('drop table devttyUSB0')
            this.load();
        });
    }
    // For DB
    load() {
        this.db.all(`SELECT * FROM Receiver`, async (err, rows) => {
            if (err) {
                try {
                    console.log(err.message + " Creando...");
                    await this.crateReceiver();
                    return;
                }
                catch (error) {
                    console.log(error);
                }
            }
            await Promise.all(rows.map(async (r) => {
                const { id, baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status, typeSender, ip, port, senderStatus } = r;
                const com = { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode };
                const rv = new receiver_1.default(id, com, delimiter, intervalHeart, heartbeat, this.db, typeSender, ack, attempt, intervalAck);
                try {
                    if (status === reciver_interface_1.Status.disconnect) {
                        return true;
                    }
                    if (typeSender !== reciver_interface_1.TypeSender.withOutServer) {
                        rv.createSender(typeSender, ip, port, senderStatus);
                    }
                    await rv.open();
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
    async newReciver(data) {
        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status } = data;
        const id = com.path.replaceAll('/', '');
        if (this.receivers.some(rv => rv.getId === id)) {
            return 'no';
        }
        // Add id
        const rv = new receiver_1.default(id, { ...com }, delimiter, intervalHeart, heartbeat, this.db, reciver_interface_1.TypeSender.withOutServer, ack, attempt, intervalAck);
        // rv.close();
        try {
            await rv.open();
            await rv.init();
            await this.save(id, data);
            this.receivers = [...this.receivers, rv];
        }
        catch (error) {
            console.log(error);
            return 'error';
        }
    }
    async save(id, data) {
        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status } = data;
        const { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode } = com;
        return new Promise((resolve, reject) => {
            this.db.run(`
                    INSERT INTO Receiver (
                        id, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, baudRate, path, typeSender, status, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits
                    ) VALUES (
                        "${id}", "${ack}", ${attempt}, "${delimiter}", "${heartbeat}", ${intervalAck}, ${intervalHeart}, ${baudRate}, "${path}", ${reciver_interface_1.TypeSender.withOutServer}, ${status}, ${dataBits}, ${highWaterMark}, "${parity}", ${rtscts}, "${rtsMode}", ${stopBits}
                    );
                `, (err) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(true);
            });
        });
    }
    async deleteReceiver(id) {
        try {
            await this.deleteRow(id);
            await this.receivers.find(f => f.getId === id)?.delete();
            this.receivers.filter(f => f.getId !== id);
        }
        catch (error) {
            console.log(error);
        }
    }
    deleteRow(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM Receiver where id="${id}"`, (err) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(true);
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
    createSender(id, typeSender, ip, port, status) {
        const reciver = this.receivers.find(f => f.getId === id);
        if (reciver) {
            reciver.createSender(typeSender, ip, port, status);
        }
    }
}
exports.Receivers = Receivers;
//# sourceMappingURL=receivers.js.map