import net from 'net';
import { Database } from 'sqlite3';
import { StatusSender } from '../interfaces/reciver.interface';
import { Sender } from './sender';

export default class sendClient extends Sender {

    constructor(db: Database, id: string, ip: string, port: number, status: StatusSender = StatusSender.connecting) {
        super(db, id, port, status,ip);
    }

    start() {
        this.setClient = new net.Socket();

        this.getClient!.on('end', async () => {
            this.setStatus = StatusSender.stop;
            await this.updateState(StatusSender.stop);
            console.log('end');
        });

        this.getClient!.on('error', (err) => {//si no esta conectado
            console.log('se desconecto el serv');
        });

        this.getClient!.once('close', async () => {//estaba encendido y se desconecto y no esta conectado
            if (this.getStatus !== StatusSender.stop) {
                if (this.getStatus !== StatusSender.connecting) {
                    await this.updateState(StatusSender.connecting);
                }
                this.setStatus = StatusSender.connecting;
                this.reconnect();
            }
            console.log('Connection closed');
        });

        this.getClient!.on('connect', async () => {
            console.log('conectado');
            await this.updateState(StatusSender.start);
            this.setStatus = StatusSender.start;
        });

        this.getClient!.connect(this.getPort, this.getIp);

    }

    private reconnect() {
        console.log('Recnecting');

        setTimeout(() => {
            this.start();
        }, 10000);

    }


    isValid() {
        return this.getStatus === StatusSender.start;
    }

    async stop() {
        if(this.getClient){
            await this.updateState(StatusSender.stop);
            this.getClient.destroy();
            this.setClient = null;
            this.setStatus = StatusSender.stop;
            return true;
        }
        throw 'No hay cliente'
    }

}