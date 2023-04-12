"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendServer = void 0;
const net_1 = __importDefault(require("net"));
const reciver_interface_1 = require("../interfaces/reciver.interface");
const sender_1 = require("./sender");
class SendServer extends sender_1.Sender {
    constructor(db, id, port, status = reciver_interface_1.StatusSender.start) {
        super(db, id, port, status);
        this.server = null;
    }
    start() {
        this.server = net_1.default.createServer((socket) => {
            if (this.getClient) {
                console.log('ya existe un cliente conectado a este serv');
                return;
            }
            this.setClient = socket;
            socket.on('close', () => {
                this.setClient = null;
            });
        });
        this.server.on('error', async (err) => {
            this.setStatus = reciver_interface_1.StatusSender.stop;
            await this.updateState(reciver_interface_1.StatusSender.stop);
            console.log(err);
        });
        this.server.listen(this.getPort, async () => {
            this.setStatus = reciver_interface_1.StatusSender.start;
            await this.updateState(reciver_interface_1.StatusSender.start);
            console.log('Serve inicializado');
        });
    }
    isValid() {
        return (this.getStatus === reciver_interface_1.StatusSender.start && this.getClient) ? true : false;
    }
    stop() {
        this.getClient?.destroy();
        return new Promise((resolve, reject) => {
            this.server?.close((err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            });
        });
    }
}
exports.SendServer = SendServer;
//# sourceMappingURL=sendServer.js.map