import express, { Application } from 'express';
import { createServer, Server as ServerHttp } from 'http';
import { Server as SocketIoServer } from 'socket.io';

import cors from 'cors';
import {ReceiverRouter} from './routes/receiver'
import { Receivers } from './controllers/receiver.controller';


class Server {

    private app: Application;
    private server: ServerHttp;
    private io: SocketIoServer;


    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketIoServer(this.server, {
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
        this.app.use(cors());
        this.app.use(express.json());
    }



    initialSokcet() {

        
        this.io.on('connection', client => {

            const receivers = Receivers.getInstance(this.io);

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
        const receivers = Receivers.getInstance(this.io);
        const router = new ReceiverRouter(receivers);
        this.app.use('/receiver', router.router);
    }
}

export default Server;