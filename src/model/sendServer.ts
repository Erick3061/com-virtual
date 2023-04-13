import net, { Server } from 'net';
import { Database } from 'sqlite3';
import { StatusSender } from '../interfaces/reciver.interface';
import { Sender } from './sender';
import { Server as SocketIoServer } from 'socket.io';

export class SendServer extends Sender {

    private server: Server | null = null;
    private io: SocketIoServer;

    constructor(io: SocketIoServer, db: Database, id: string, port: number, status: StatusSender = StatusSender.stop) {
        super(db, id, port, status);
        this.io = io;
    }

    start() {

        this.server = net.createServer((socket) => {
            if (this.getClient) return;
            this.setClient = socket;


            socket.on('close', () => this.setClient = null);
        });

        this.server.on("close", async () => {
            this.setStatus = StatusSender.stop;
            await this.updateState(StatusSender.stop);
        })

        this.server.on('error', async (err) => {
            this.setStatus = StatusSender.stop;
            await this.updateState(StatusSender.stop);
            this.io.emit(`sender-${this.getid}`, { msg: err.message, status: this.getStatus });
        });

        this.server.listen(this.getPort, async () => {
            this.setStatus = StatusSender.start;
            await this.updateState(StatusSender.start);
        });

    }

    isValid() {
        return (this.getStatus === StatusSender.start && this.getClient) ? true : false;
    }

    stop() {
        this.getClient?.destroy();
        return new Promise<boolean>((resolve, reject) => {

            this.server?.close((err) => {
                if (err) {
                    return reject(err.message);
                }
                this.server = null;
                resolve(true);
            });

        })
    }

}