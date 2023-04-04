import express, { Application, Request } from 'express';
import { createServer, Server as ServerHttp } from 'http';
import { Socket, Server as SocketIoServer } from 'socket.io';

import cors from 'cors';
import receiverRoutes from './routes/receiver'
import { Receivers } from './model/receivers';


export const receivers = new Receivers();

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
        this.server.listen(4000, () => {
            console.log(`Server on port ${4000}`);
        });
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use((req: Request, res, next) => {
            // @ts-ignore
            req.io = this.io;
            next();
        })
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
        this.app.use('/receiver', receiverRoutes);
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


    // public get io(): SocketIoServer {
    //     return this.Io;
    // }

}

export default Server;