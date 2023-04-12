import path from "path";
import sqlite from 'sqlite3';
import { Server as SocketIoServer } from 'socket.io';
import Receiver from '../model/receiver'

import { Status, TypeSender, ReceiverDB, ReceiverPost, SenderPost, StatusSender } from '../interfaces/reciver.interface';


export class Receivers {

    private receivers: Array<Receiver> = [];
    private db: sqlite.Database;
    private io: SocketIoServer;
    private static instance: Receivers;

    private constructor(io: SocketIoServer) {
        const dir: string = path.join(__dirname, '../../../db');
        this.io = io;
        this.db = new sqlite.Database(path.join(dir, 'db.db'),
            (err) => {
                if (err) {
                    this.io.emit("sdgjh");
                    console.log(`Fallo al crear la base de datos ${err}`);
                    return;
                }
                this.load();
            });
    }

    public static getInstance(io: SocketIoServer) {
        if (!Receivers.instance) {
            Receivers.instance = new Receivers(io);
        }
        return Receivers.instance;
    }

    // ********************************
    load() {

        this.db.all(`SELECT * FROM Receiver`, async (err, rows: Array<ReceiverDB>) => {
            if (err) {
                try {
                    await this.crateReceiver();
                    return;
                } catch (error) {
                    console.log(error);
                }
            }
            await Promise.all(rows.map(async receiver => {

                const { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status, typeSender, ip, port, senderStatus } = receiver;
                const com = { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode };


                const rv = new Receiver(intervalHeart, this.db, heartbeat, ack, this.io, delimiter, com, attempt, intervalAck, status, typeSender);

                try {
                    if (status === Status.disconnect) {
                        return true;
                    }
                    // TODO
                    if (typeSender !== TypeSender.withOutServer) {
                        rv.createSender(typeSender, ip, port, senderStatus);
                    }

                    await rv.open();
                    // TODO Verificar la existencia de la tabla para sus eventos
                    // await this.createTableEventReceiver(rv.getId);
                    await rv.init();
                    return true;
                } catch (error) {
                    console.log(error);
                } finally {
                    this.receivers = [...this.receivers, rv];
                }

            }));
        });
    }

    // ********************************
    async newReciver(data: ReceiverPost) {

        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart } = data;

        const id = com.path.replaceAll('/', '');

        if (this.receivers.some(rv => rv.getId === id)) {
            return 'Puerto serial en uso';
        }

        const rv = new Receiver(intervalHeart, this.db, heartbeat, ack, this.io, delimiter, com, attempt, intervalAck);

        try {
            await rv.open();
            await this.save(rv.getId, data);
            await rv.init();
            this.receivers = [...this.receivers, rv];
            return rv;
        } catch (error) {
            await rv.close();
            return `${error}`;
        }
    }

    // ********************************
    async stopReceiver(id: string) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            throw 'Receiver with ID not exist';
        }
        await this.stopSender(id);
        await rv.close();

        await this.updateState(id, Status.disconnect);
    }

    // ******************************
    async startReceiver(id: string) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            throw 'Receiver with ID not exist';
        }
        await rv.open();
        await rv.init();
        await this.updateState(id, Status.connect);

    }

    // *******************************
    async removeReciver(id: string) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            throw 'Receiver with ID not exist';
        }
        //TODO
        await this.deleteDB(id);
        await this.deleteSender(id);
        await rv.close();
        this.receivers = this.receivers.filter(rv => rv.getId != id);
    }

    // ******************************
    getAll() {
        return this.receivers.map(rv => rv.getInformation())
    }


    // *****************************
    async addSender(id: string, data: SenderPost) {

        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) throw 'Receiver with ID not exist';

        data.ip = data.ip || "127.0.0.1";
        const revs = this.getAll();
        if (revs.find(rv => rv.ip === data.ip && rv.port === data.port)) {
            throw 'Sender ocupado';
        }

        if (data.ip.includes("127.0.0.1")) {
            await this.saveSender(id, data, TypeSender.withServer);
            rv.createSender(TypeSender.withServer, data.ip, data.port!, StatusSender.start);
        } else {
            await this.saveSender(id, data, TypeSender.withClient);
            rv.createSender(TypeSender.withClient, data.ip, data.port!, StatusSender.connecting);
        }

    }

    async stopSender(id: string, isDelete: boolean= false, deleteAll:boolean=false) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) throw 'Receiver with ID not exist';
        await rv.stopSender(isDelete, deleteAll);
    }

    async startSender(id: string) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) throw 'Receiver with ID not exist';
        rv.startSender();
    }

    async deleteSender(id: string) {
        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) throw 'Receiver with ID not exist';

        await this.stopSender(id, true, true);

        rv.resetSender();
        await this.saveSender(id, {}, TypeSender.withOutServer);

    }














    stopSenderReciver(id: string) {

        const rv = this.receivers.find(rv => rv.getId === id);
        if (!rv) {
            return 'Receiver with ID not exist';
        }

    }


    // * DB
    async save(id: string, data: ReceiverPost) {
        try {
            await this.saveRV(id, data);
            await this.createTableEventReceiver(id);
            return true;
        } catch (error) {
            await this.deleteDB(id);
            if (typeof error === "string") {
                throw error;
            }
            throw 'Error no controlado';
        }
    }

    private async saveRV(id: string, data: ReceiverPost) {
        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart } = data;
        const { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode } = com;
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(`
                    INSERT INTO Receiver (
                        id, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, baudRate, path, typeSender, status, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits
                    ) VALUES (
                        "${id}", "${ack}", ${attempt}, "${delimiter}", "${heartbeat}", ${intervalAck}, ${intervalHeart}, ${baudRate}, "${path}", ${TypeSender.withOutServer}, ${Status.connect}, ${dataBits}, ${highWaterMark}, "${parity}", ${rtscts}, "${rtsMode}", ${stopBits}
                    );
                `,
                (err) => {
                    if (err) {
                        return reject(err.message);
                    }
                    return resolve(true);
                });
        });
    }

    private async saveSender(id: string, data: SenderPost, typeSender: TypeSender) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(`
                    UPDATE Receiver SET  ip = ${data.ip ? `"${data.ip}"` : "NULL"}, typeSender = ${typeSender}, port = ${data.port ? data.port : "NULL"} where id = "${id}";
                `,
                (err) => {
                    if (err) {
                        return reject(err.message);
                    }
                    return resolve(true);
                });
        });
    }

    private async createTableEventReceiver(id: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(
                `
                    CREATE TABLE IF NOT EXISTS ${id} (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)
                `
                , (err) => {
                    if (err) {
                        return reject(err.message);

                    }
                    resolve(true);
                });
        });
    }

    private updateState(id: string, state: Status) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE Receiver set status = ${state} WHERE id = "${id}"`, (err) => {
                if (err) {
                    return reject(err.message);
                }
                resolve(true);
            })
        })
    }


    private deleteDB(id: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(
                `
                    DELETE FROM Receiver where id = "${id}"
                `
                , (err) => {
                    if (err) {
                        return reject(err.message);
                    }
                    this.db.run(`DROP TABLE IF EXISTS ${id}`,
                        (err) => {
                            if (err) return reject(err.message);
                            return resolve(true);
                        }
                    );
                });
        });
    }

    private crateReceiver() {
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(
                `
                    CREATE TABLE IF NOT EXISTS Receiver (
                        id TEXT PRIMARY KEY,
                        ack TEXT,
                        attempt INTEGER,
                        delimiter TEXT,
                        heartbeat TEXT,
                        intervalAck INTEGER,
                        intervalHeart INTEGER,
                        status INTEGER,
                        typeSender INTEGER,
                        baudRate INTEGER,
                        path TEXT,
                        dataBits INTEGER,
                        highWaterMark INTEGER,
                        parity TEXT,
                        rtscts BOOLEAN,
                        rtsMode TEXT,
                        stopBits DOUBLE,
                        ip TEXT,
                        port INTEGER,
                        senderStatus INTEFER
                    )
                    `
                , (err) => {
                    if (err) {
                        return reject(err.message);
                    }
                    resolve(true);
                })
        });
    }


}