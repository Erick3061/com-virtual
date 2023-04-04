import Reciver from "./src/model/receiver";
import http from 'http';
// import express from 'express';
import io from 'socket.io';
import cors from 'cors';
import Server from "./src/server";

// const app = express();
// const server = http.createServer();

// export const Io = new io.Server(server, {
//     cors: {
//         origin: '*'
//     }
// });

// server.listen(4000, () => {
//     console.log(`Socket running on port: ${4000}`);
// });

// require('./src/sockets/socket');

export const server = new Server();
server.listen();

// (async () => {
//     try {
//         // const t = new Reciver(
//         //     {
//         //         path: '/dev/ttyUSB0',
//         //         baudRate: 9600,
//         //         autoOpen: false,

//         //     },
//         //     '14',
//         //     31,//seconds
//         //     '101000           @'
//         // );

//         // await t.open();
//         // t.emit();
//         // t.load();
//         // t.createSender();
//         // t.read();

//         // setTimeout(async () => {
//         //     try {
//         //         console.log('hola');

//         //         await t.close();
//         //     } catch (error) {
//         //         console.log(error);

//         //     }
//         // }, 30000)

//     } catch (error) {
//         console.log(error);
//     }
// })()

