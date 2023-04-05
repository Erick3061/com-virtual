"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../../app");
app_1.Io.on('connection', client => {
    console.log('Cliente conectado');
    console.log(client.id);
    client.on('disconnect', () => {
        console.log('Cliente Desconectado');
    });
    client.on('mensaje', (payload) => {
        console.log('Mensaje', { payload });
        app_1.Io.emit('mensaje', { admin: 'Nuevo mensaje' });
    });
    client.on('qqqq', (payload) => {
        console.log(payload);
        app_1.Io.emit('nuevo-mensaje', 'HEY...' + payload);
    });
});
//# sourceMappingURL=socket.js.map