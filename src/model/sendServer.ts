import net, { Server } from 'net';
import { Database } from 'sqlite3';
import { StatusSender } from '../interfaces/reciver.interface';
import { Sender } from './sender';

export class SendServer extends Sender {

    private server: Server | null = null;
    private port: number;
    private status: StatusSender;


    constructor(db: Database, id: string, port: number, status: StatusSender = StatusSender.start) {
        super(db, id);
        this.port = port;
        this.status = status;
    }

    start() {

        this.server = net.createServer((socket) => {
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
            this.status = StatusSender.stop;
            await this.updateState(StatusSender.stop);
            console.log(err);
        });

        this.server.listen(this.port, async () => {
            this.status = StatusSender.start;
            await this.updateState(StatusSender.start);
            console.log('Serve inicializado');
        });

        setTimeout(() => {
            this.stop();
        }, 10000);

    }


    public get state(): StatusSender {
        return this.status;
    }


    isValid() {
        return (this.status === StatusSender.start && this.getClient) ? true : false;
    }

    stop() {
        this.getClient?.destroy();
        this.server?.close();
    }

}