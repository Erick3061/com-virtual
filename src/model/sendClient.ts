import net from 'net';
import { Sender } from '../interfaces/sender';

export enum Status {
    'connected' = 1,
    'reconnect' = 2,
    'disconnet' = 3,
}

export default class sendClient {

    private client: net.Socket | null = null;
    private ip: string;
    private port: number;
    private attempts: number;
    private status: Status = Status.disconnet;

    constructor(ip: string, port: number, attempts: number = 3) {
        this.ip = ip;
        this.port = port;
        this.attempts = attempts;
    }

    start() {
        this.client = new net.Socket();

        this.client.on('end', () => {
            this.status = Status.disconnet;
            console.log('end');
        });

        this.client.on('error', (err) => {//si no esta conectado
            console.log('se desconecto el serv');
        });

        this.client.once('close', () => {//estaba encendido y se desconecto y no esta conectado
            this.status = Status.disconnet;
            this.reconnect();
            console.log('Connection closed');
        });

        this.client.on('connect', () => {
            console.log('conectado');
            this.status = Status.connected;
        });

        this.client.connect(this.port, this.ip);

    }

    disconnect() {
        if (this.client) {
            this.client.destroy();
        }
    }

    reconnect() {
        console.log('Recnecting');

        setTimeout(() => {
            this.start();
        }, 10000);

    }

    emit(data: string) {
        this.client && this.client.write(data);
    }

    private controllerAck() {

        return new Promise<string>((resolve, reject) => {
            this.client && this.client.once('data', data => {
                console.log(data[0]);
                if (data[0] !== 0x06) {
                    return reject('');
                }
                return resolve('');
            });
        });
    }

    waitAck(interval: number) {
        return Promise.race([
            this.controllerAck(),
            this.timeout(interval),
        ])
    }


    public get state(): Status {
        return this.status;
    }


    private timeout(interval: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                return reject();
            }, interval);
        })
    }


    isValid() {
        return this.status === Status.connected;
    }

}