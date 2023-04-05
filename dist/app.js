"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const server_1 = __importDefault(require("./src/server"));
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
exports.server = new server_1.default();
exports.server.listen();
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
//# sourceMappingURL=app.js.map