import net from 'net';
import { Database } from 'sqlite3';
import { StatusSender } from '../interfaces/reciver.interface';
import { Sender } from './sender';
import { Server as SocketIoServer } from 'socket.io';

export default class sendClient extends Sender {

    private io: SocketIoServer;

    constructor(io: SocketIoServer, db: Database, id: string, ip: string, port: number, status: StatusSender = StatusSender.connecting) {
        super(db, id, port, status, ip);
        this.io = io;
    }

    start() {
        this.setStatus = StatusSender.connecting;
        this.setClient = new net.Socket();

        this.getClient!.on('end', async () => {
            this.setStatus = StatusSender.stop;
            await this.updateState(StatusSender.stop);
            this.io.emit(`sender-${this.getid}`, { msg: 'Error server offline', status: this.getStatus });
        });

        this.getClient!.on('error', (err) => {//si no esta conectado
        });

        this.getClient!.once('close', async () => {//estaba encendido y se desconecto y no esta conectado
            if (this.getStatus !== StatusSender.stop) {
                // if (this.getStatus !== StatusSender.connecting) {
                //     // await this.updateState(StatusSender.connecting);
                // }
                this.io.emit(`sender-${this.getid}`, { msg: 'Error server offline - Reconnecting', status: this.getStatus });
                this.setStatus = StatusSender.connecting;
                this.reconnect();
            }
        });

        this.getClient!.on('connect', async () => {
            await this.updateState(StatusSender.start);
            this.setStatus = StatusSender.start;
            this.io.emit(`sender-${this.getid}`, { msg: 'server online', status: this.getStatus });
        });

        this.getClient!.connect(this.getPort, this.getIp);

    }

    private reconnect() {
        setTimeout(() => {
            this.start();
        }, 10000);
    }

    isValid() {
        return this.getStatus === StatusSender.start;
    }

    async stop() {
        if (this.getClient) {
            await this.updateState(StatusSender.stop);
            this.getClient.destroy();
            this.setClient = null;
            this.setStatus = StatusSender.stop;
            return true;
        }
        throw 'No hay cliente'
    }

}