"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const reciver_interface_1 = require("../interfaces/reciver.interface");
const sender_1 = require("./sender");
class sendClient extends sender_1.Sender {
    constructor(db, id, ip, port, status = reciver_interface_1.StatusSender.connecting) {
        super(db, id);
        this.ip = ip;
        this.port = port;
        this.status = status;
    }
    start() {
        this.setClient = new net_1.default.Socket();
        this.getClient.on('end', async () => {
            this.status = reciver_interface_1.StatusSender.stop;
            await this.updateState(reciver_interface_1.StatusSender.stop);
            console.log('end');
        });
        this.getClient.on('error', (err) => {
            console.log('se desconecto el serv');
        });
        this.getClient.once('close', async () => {
            if (this.status !== reciver_interface_1.StatusSender.stop) {
                if (this.status !== reciver_interface_1.StatusSender.connecting) {
                    await this.updateState(reciver_interface_1.StatusSender.connecting);
                }
                this.status = reciver_interface_1.StatusSender.connecting;
                this.reconnect();
            }
            console.log('Connection closed');
        });
        this.getClient.on('connect', async () => {
            console.log('conectado');
            await this.updateState(reciver_interface_1.StatusSender.start);
            this.status = reciver_interface_1.StatusSender.start;
        });
        this.getClient.connect(this.port, this.ip);
        setTimeout(() => {
            this.stop();
        }, 10000);
    }
    disconnect() {
        if (this.getClient) {
            this.getClient.destroy();
        }
    }
    reconnect() {
        console.log('Recnecting');
        setTimeout(() => {
            this.start();
        }, 10000);
    }
    get state() {
        return this.status;
    }
    isValid() {
        return this.status === reciver_interface_1.StatusSender.start;
    }
    stop() {
        this.getClient?.destroy();
        this.status = reciver_interface_1.StatusSender.stop;
    }
}
exports.default = sendClient;
//# sourceMappingURL=sendClient.js.map