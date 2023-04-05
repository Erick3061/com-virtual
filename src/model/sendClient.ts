import net from 'net';
import { Database } from 'sqlite3';
import { StatusSender } from '../interfaces/reciver.interface';
import { Sender } from './sender';

export default class sendClient extends Sender {


    private ip: string;
    private port: number;
    private status: StatusSender;


    constructor(db: Database, id: string, ip: string, port: number, status: StatusSender = StatusSender.connecting) {
        super(db, id);
        this.ip = ip;
        this.port = port;
        this.status = status;
    }

    start() {
        this.setClient = new net.Socket();

        this.getClient!.on('end', async () => {
            this.status = StatusSender.stop;
            await this.updateState(StatusSender.stop);
            console.log('end');
        });

        this.getClient!.on('error', (err) => {//si no esta conectado
            console.log('se desconecto el serv');
        });

        this.getClient!.once('close', async () => {//estaba encendido y se desconecto y no esta conectado
            if (this.status !== StatusSender.stop) {
                if (this.status !== StatusSender.connecting) {
                    await this.updateState(StatusSender.connecting);
                }
                this.status = StatusSender.connecting;
                this.reconnect();
            }
            console.log('Connection closed');
        });

        this.getClient!.on('connect', async () => {
            console.log('conectado');
            await this.updateState(StatusSender.start);
            this.status = StatusSender.start;
        });

        this.getClient!.connect(this.port, this.ip);

        setTimeout(() => {
            this.stop();
        }, 10000);
    }

    disconnect() {
        if (this.getClient) {
            this.getClient.destroy();
        }
    }

    reconnect() {
        console.log('Recnecting');

        setTimeout(() => {
            this.start();
        }, 10000);

    }

    public get state(): StatusSender {
        return this.status;
    }


    isValid() {
        return this.status === StatusSender.start;
    }

    stop() {
        this.getClient?.destroy();
        this.status = StatusSender.stop;
    }



}