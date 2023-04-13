import net from 'net';
import { Database } from 'sqlite3';
import { StatusSender } from '../interfaces/reciver.interface';


export class Sender {

    private client: net.Socket | null = null;
    private db: Database;
    private id: string;
    private port: number;
    private status: StatusSender;
    private ip: string;



    constructor(db: Database, id: string, port: number, status: StatusSender, ip: string = "127.0.0.1") {
        this.db = db;
        this.id = id;
        this.port = port;
        this.status = status;
        this.ip = ip;
    }


    protected set setClient(value: net.Socket | null) {
        this.client = value;
    }
    protected set setStatus(value: StatusSender) {
        this.status = value;
    }


    protected get getClient(): net.Socket | null {
        return this.client!;
    }

    public get getPort() {
        return this.port

    }

    public get getStatus() {
        return this.status
    }

    public get getIp() {
        return this.ip
    }

    public get getid(): string {
        return this.id;
    }


    protected controllerAck() {

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

    private timeout(interval: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                return reject();
            }, interval);
        })
    }

    protected updateState(newState: StatusSender) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(`update Receiver set senderStatus = ${newState} where id="${this.id}"`, (err) => err ? reject(err.message) : resolve(true));
        });
    }

    emit(data: string) {
        this.client && this.client.write(data);
    }

}