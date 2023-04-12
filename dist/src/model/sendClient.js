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
        super(db, id, port, status, ip);
    }
    start() {
        this.setClient = new net_1.default.Socket();
        this.getClient.on('end', async () => {
            this.setStatus = reciver_interface_1.StatusSender.stop;
            await this.updateState(reciver_interface_1.StatusSender.stop);
            console.log('end');
        });
        this.getClient.on('error', (err) => {
            console.log('se desconecto el serv');
        });
        this.getClient.once('close', async () => {
            if (this.getStatus !== reciver_interface_1.StatusSender.stop) {
                if (this.getStatus !== reciver_interface_1.StatusSender.connecting) {
                    await this.updateState(reciver_interface_1.StatusSender.connecting);
                }
                this.setStatus = reciver_interface_1.StatusSender.connecting;
                this.reconnect();
            }
            console.log('Connection closed');
        });
        this.getClient.on('connect', async () => {
            console.log('conectado');
            await this.updateState(reciver_interface_1.StatusSender.start);
            this.setStatus = reciver_interface_1.StatusSender.start;
        });
        this.getClient.connect(this.getPort, this.getIp);
    }
    reconnect() {
        console.log('Recnecting');
        setTimeout(() => {
            this.start();
        }, 10000);
    }
    isValid() {
        return this.getStatus === reciver_interface_1.StatusSender.start;
    }
    stop() {
        if (this.getClient) {
            this.getClient.destroy();
            this.setStatus = reciver_interface_1.StatusSender.stop;
        }
    }
}
exports.default = sendClient;
//# sourceMappingURL=sendClient.js.map