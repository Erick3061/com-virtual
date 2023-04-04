import net, { Server, Socket } from 'net';


export enum Status {
    'start' = 1,
    'stop' = 2,
}

export class SendServer {

    private server: Server | null = null;
    private client: Socket | null = null;
    private port: number;
    private status: Status = Status.stop;

    constructor(port: number) {
        this.port = port;
    }

    start() {

        this.server = net.createServer((socket) => {
            if (this.client) {
                console.log('ya existe un cliente conectado a este serv');
                return;
            }
            this.client = socket;

            socket.on('close', () => {
                this.client = null;
            });

        });

        this.server.on('error', (err) => {
            console.log(err);
        });

        this.server.listen(this.port, () => {
            this.status = Status.start;
            console.log('Serve inicializado');
        });
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
        return (this.status === Status.start && this.client) ? true : false;
    }


}