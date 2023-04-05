"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivers = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const receiver_1 = __importDefault(require("./routes/receiver"));
const receivers_1 = require("./model/receivers");
exports.receivers = new receivers_1.Receivers();
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
        this.server.listen(4000, () => {
            console.log(`Server on port ${4000}`);
        });
    }
    middlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use((req, res, next) => {
            // @ts-ignore
            req.io = this.io;
            next();
        });
    }
    initialSokcet() {
        this.io.on('connection', client => {
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
        this.app.use('/receiver', receiver_1.default);
        // this.app.post('/new', (req, res) => {
        //     const { id } = req.query;
        //     // console.log(req.query);
        //     const algo = new Example(this.io, id as string);
        //     this.recibers = [...this.recibers, algo];
        //     res.json({
        //         msg: 'server created'
        //     })
        // })
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map