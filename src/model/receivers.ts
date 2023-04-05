import { Receiver as ReceiverInterface, COM, Status, TypeSender, StatusSender } from '../interfaces/reciver.interface';
import Receiver from './receiver'
import sqlite from 'sqlite3';
import path from 'path';
import async from 'async';


type Re = Omit<ReceiverInterface, 'com'>;

interface ReceiverResponse extends Re, COM {
    id: string;
    typeSender: TypeSender;
    ip: string;
    port: number;
    senderStatus: StatusSender;
}

export class Receivers {

    private receivers: Array<Receiver> = [];
    private db: sqlite.Database;

    constructor() {
        const dir: string = path.join(__dirname, '../../../db');

        this.db = new sqlite.Database(path.join(dir, 'db.db'),
            (err) => {
                if (err) {
                    console.log(`Fallo al crear la base de datos ${err}`);
                    return;
                }
                // this.db.run('drop table Receiver')
                // this.db.run('drop table devttyUSB0')
                this.load();
            });
    }

    // For DB
    load() {
        this.db.all(`SELECT * FROM Receiver`, async (err, rows: Array<ReceiverResponse>) => {
            if (err) {
                try {
                    console.log(err.message + " Creando...");
                    await this.crateReceiver();
                    return;
                } catch (error) {
                    console.log(error);
                }
            }
            await Promise.all(rows.map(async r => {

                const { id, baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status, typeSender, ip, port, senderStatus } = r;
                const com = { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode };

                const rv = new Receiver(id, com, delimiter, intervalHeart, heartbeat, this.db, typeSender, ack, attempt, intervalAck);
                try {
                    if (status === Status.disconnect) {
                        return true;
                    }
                    if (typeSender !== TypeSender.withOutServer) {
                        rv.createSender(typeSender, ip, port, senderStatus);
                    }
                    await rv.open();
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

    async newReciver(data: ReceiverInterface) {

        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, status } = data;

        const id = com.path.replaceAll('/', '');
        if (this.receivers.some(rv => rv.getId === id)) {
            return 'no';
        }

        // Add id
        const rv = new Receiver(id, { ...com }, delimiter, intervalHeart, heartbeat, this.db, TypeSender.withOutServer, ack, attempt, intervalAck);
        // rv.close();
        try {
            await rv.open();
            await rv.init();
            await this.save(id, data);
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


    async deleteReceiver(id: string) {
        try {
            await this.deleteRow(id);
            await this.receivers.find(f => f.getId === id)?.delete();
            this.receivers.filter(f => f.getId !== id);
        } catch (error) {
            console.log(error);
        }
    }

    private deleteRow(id: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(`DELETE FROM Receiver where id="${id}"`,
                (err) => {
                    if (err) {
                        return reject(err.message)
                    }
                    return resolve(true);
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

    createSender(id: string, typeSender: TypeSender, ip: string, port: number, status: StatusSender) {
        const reciver = this.receivers.find(f => f.getId === id);
        if (reciver) {
            reciver.createSender(typeSender, ip, port, status);
        }
    }

}