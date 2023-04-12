"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sender = void 0;
class Sender {
    constructor(db, id, port, status, ip = "127.0.0.1") {
        this.client = null;
        this.db = db;
        this.id = id;
        this.port = port;
        this.status = status;
        this.ip = ip;
    }
    set setClient(value) {
        this.client = value;
    }
    set setStatus(value) {
        this.status = value;
    }
    get getClient() {
        return this.client;
    }
    get getPort() {
        return this.port;
    }
    get getStatus() {
        return this.status;
    }
    get getIp() {
        return this.ip;
    }
    controllerAck() {
        return new Promise((resolve, reject) => {
            this.client && this.client.once('data', data => {
                console.log(data[0]);
                if (data[0] !== 0x06) {
                    return reject('');
                }
                return resolve('');
            });
        });
    }
    waitAck(interval) {
        return Promise.race([
            this.controllerAck(),
            this.timeout(interval),
        ]);
    }
    timeout(interval) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return reject();
            }, interval);
        });
    }
    updateState(newState) {
        return new Promise((resolve, reject) => {
            this.db.run(`update Receiver set senderStatus = ${newState} where id="${this.id}"`, (err) => err ? reject(err.message) : resolve(true));
        });
    }
    emit(data) {
        this.client && this.client.write(data);
    }
}
exports.Sender = Sender;
//# sourceMappingURL=sender.js.map