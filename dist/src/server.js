"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const receiver_1 = require("./routes/receiver");
const receiver_controller_1 = require("./controllers/receiver.controller");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: { origin: '*' }
        });
    }
    listen() {
        this.middlewares();
        this.routes();
        this.initialSokcet();
        this.server.listen(4000, () => {
            console.log(`Server on port ${4000}`);
        });
    }
    middlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    initialSokcet() {
        this.io.on('connection', client => {
            const receivers = receiver_controller_1.Receivers.getInstance(this.io);
            client.emit('all', receivers.getAll());
            console.log('Cliente conectado');
            console.log(client.id);
            client.on('disconnect', () => {
                console.log('Cliente Desconectado');
            });
            client.on('mensaje', (payload) => {
                console.log('Mensaje', { payload });
                // io.emit('mensaje', { admin: 'Nuevo mensaje' })
            });
            client.on('qqqq', (payload) => {
                console.log(payload);
                // client.emit('nuevo-mensaje', 'HEY...' + payload);
            });
        });
    }
    routes() {
        // Router and controller
        const receivers = receiver_controller_1.Receivers.getInstance(this.io);
        const router = new receiver_1.ReceiverRouter(receivers);
        this.app.use('/receiver', router.router);
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map