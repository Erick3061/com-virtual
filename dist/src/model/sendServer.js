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
        super(db, id);
        this.server = null;
        this.port = port;
        this.status = status;
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
            this.status = reciver_interface_1.StatusSender.stop;
            await this.updateState(reciver_interface_1.StatusSender.stop);
            console.log(err);
        });
        this.server.listen(this.port, async () => {
            this.status = reciver_interface_1.StatusSender.start;
            await this.updateState(reciver_interface_1.StatusSender.start);
            console.log('Serve inicializado');
        });
        setTimeout(() => {
            this.stop();
        }, 10000);
    }
    get state() {
        return this.status;
    }
    isValid() {
        return (this.status === reciver_interface_1.StatusSender.start && this.getClient) ? true : false;
    }
    stop() {
        this.getClient?.destroy();
        this.server?.close();
    }
}
exports.SendServer = SendServer;
//# sourceMappingURL=sendServer.js.map