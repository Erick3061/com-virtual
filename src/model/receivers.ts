import { Receiver as ReceiverInterface } from "../interfaces/reciver.interface";
import Receiver from './example'
import sqlite from 'sqlite3';
import path from 'path';


export class Receivers {



    private receivers: Array<Receiver> = [];
    private db: sqlite.Database;

    constructor() {
        this.db = new sqlite.Database(path.join(__dirname, 'db.db'),
            (err) => {
                if (err) {
                    console.log(`Fallo al crear la base de datos ${err}`);
                    return;
                }
                // this.db.run('DROP TABLE Receiver');
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
                        isServerSender BOOLEAN,
                        baudRate INTEGER,
                        path TEXT,
                        dataBits INTEGER,
                        highWaterMark INTEGER,
                        parity TEXT,
                        rtscts BOOLEAN,
                        rtsMode TEXT,
                        stopBits DOUBLE
                    )
                    `
                    , (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    })
            });

        this.load();
    }


    // For DB
    load() {


        this.db.all(`SELECT * FROM Receiver`, (err, rows: Array<any>) => {
            if (err) {
                console.log(err);
                return;
            }
            rows.forEach(r => {
                const { id, baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, isServerSender, status } = r;
                const com = { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode };

                const rv = new Receiver(id, com, delimiter, intervalHeart, heartbeat, attempt, intervalAck);
                rv.open();
                rv.emit();
                rv.load();
                rv.read();
                this.receivers = [...this.receivers, rv];
            });
        });
    }

    async newReciver(data: ReceiverInterface) {

        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, isServerSender, status } = data;

        if (this.receivers.some(rv => rv.getId === data.com.path)) {
            return 'no';
        }

        const id = com.path.replaceAll('/', '');
        // Add id
        const rv = new Receiver(id, { ...com }, delimiter, intervalHeart, heartbeat, attempt, intervalAck);
        // rv.close();
        try {
            await rv.open();
            await this.save(id, data);
            rv.emit();
            rv.load();
            // rv.createSender();
            rv.read();
            this.receivers = [...this.receivers, rv];

        } catch (error) {
            console.log(error);

            return 'error';
        }
    }

    private async save(id: string, data: ReceiverInterface) {
        const { com, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, isServerSender, status } = data;
        const { baudRate, path, dataBits, highWaterMark, parity, stopBits, rtscts, rtsMode } = com;
        return new Promise<boolean>((resolve, reject) => {
            this.db.run(`
                    INSERT INTO Receiver ( 
                        id, ack, attempt, delimiter, heartbeat, intervalAck, intervalHeart, baudRate, path, isServerSender, status, dataBits, highWaterMark, parity, rtscts, rtsMode, stopBits
                    ) VALUES (
                        "${id}", "${ack}", ${attempt}, "${delimiter}", "${heartbeat}", ${intervalAck}, ${intervalHeart}, ${baudRate}, "${path}", ${isServerSender}, ${status}, ${dataBits}, ${highWaterMark}, "${parity}", ${rtscts}, "${rtsMode}", ${stopBits}
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


}