"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReceiver = exports.newReceiver = void 0;
const server_1 = require("../server");
const newReceiver = async (req, res) => {
    const data = req.body;
    const rp = await server_1.receivers.newReciver(data);
    // @ts-ignore
    // examples.new(id, req.io);
    // try {
    //     const a = await SerialPort.list().then((ports) => ports).catch(err => `${err}`);
    //     if (typeof a === 'string') {
    //         return res.json({
    //             error: a
    //         })
    //     }
    //     return res.json({
    //         a
    //     })
    // } catch (error) {
    //     console.log(error);
    // }
    res.json({
        msg: rp
    });
};
exports.newReceiver = newReceiver;
const deleteReceiver = async (req, res) => {
    // const { id } = req.params;
    await server_1.receivers.deleteReceiver('devttyUSB1');
    res.json({
        msg: true
    });
};
exports.deleteReceiver = deleteReceiver;
//# sourceMappingURL=receiver.controller.js.map