import path from "path";
import sqlite from 'sqlite3';
import { Server as SocketIoServer } from 'socket.io';
import Receiver from './receiver'

import { Receiver as ReceiverInterface, COM, Status, TypeSender, StatusSender } from '../interfaces/reciver.interface';



export class Receivers {

    private receivers: Array<Receiver> = [];
    private db: sqlite.Database;
    private io: SocketIoServer;
    private static instance: Receivers;

    private constructor(io: SocketIoServer){
        const dir: string = path.join(__dirname, '../../../db');
        this.io = io;
        this.db = new sqlite.Database(path.join(dir, 'db.db'),
            (err) => {
                if (err) {
                    this.io.emit("sdgjh");
                    console.log(`Fallo al crear la base de datos ${err}`);
                    return;
                }
                // this.db.run('drop table Receiver')
                // this.db.run('drop table devttyUSB0')
                // this.load();
            });
    }

    // load() {
    //     this.db.all(`SELECT * FROM Receiver`, async (err, rows: Array<ReceiverResponse>) => {
    //         if (err) {
    //             try {
    //                 console.log(err.message + " Creando...");
    //                 await this.crateReceiver();
    //                 return;
    //             } catch (error) {
    //                 console.log(error);
    //             }
    //         }
    //         await Promise.all(rows.map(async r => {

    //             const { id, baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status, typeSender, ip, port, senderStatus } = r;
    //             const com = { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode };

    //             // const rv = new Receiver(id, com, delimiter, intervalHeart, heartbeat, this.db, typeSender, ack, attempt, intervalAck);
    //             const rv = new Receiver(intervalHeart, this.db, heartbeat, typeSender, ack, delimiter, com, attempt, intervalAck);
    //             try {
    //                 if (status === Status.disconnect) {
    //                     return true;
    //                 }
    //                 if (typeSender !== TypeSender.withOutServer) {
    //                     rv.createSender(typeSender, ip, port, senderStatus);
    //                 }
    //                 await rv.open();
    //                 await rv.init();
    //                 return true;
    //             } catch (error) {
    //                 console.log(error);
    //             } finally {
    //                 this.receivers = [...this.receivers, rv];
    //             }

    //         }));
    //     });
    // }

    public static getInstance(io: SocketIoServer){
        if(!Receivers.instance){
            Receivers.instance = new Receivers(io);
        }
        return Receivers.instance;
    }


    async newReciver(data: ReceiverInterface) {

        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status } = data;

        const id = com.path.replaceAll('/', '');

        if (this.receivers.some(rv => rv.getId === id)) {
            return 'no';
        }

        // Add id
        const rv = new Receiver(intervalHeart, this.db, heartbeat, 2, ack, this.io, delimiter, com, attempt, intervalAck);
        // rv.close();
        try {
            await rv.open();
            await rv.init();
            await this.save(rv.getId, data);
            this.receivers = [...this.receivers, rv];
        } catch (error) {
            console.log(error);

            return 'error';
        }
    }

    private async save(id: string, data: ReceiverInterface) {
        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status } = data;
        const { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode } = com;
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(`
                    INSERT INTO Receiver (
                        id, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, baudRate, path, typeSender, status, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits
                    ) VALUES (
                        "${id}", "${ack}", ${attempt}, "${delimiter}", "${heartbeat}", ${intervalAck}, ${intervalHeart}, ${baudRate}, "${path}", ${TypeSender.withOutServer}, ${status}, ${dataBits}, ${highWaterMark}, "${parity}", ${rtscts}, "${rtsMode}", ${stopBits}
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

    getAll(){
        return {
            msg: 'todas'
        }
    }
}