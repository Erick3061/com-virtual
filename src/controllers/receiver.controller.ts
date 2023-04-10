// import { Request, Response } from "express";
// import { SerialPort } from 'serialport'
// import { Receiver } from "../interfaces/reciver.interface";
// import { receivers } from '../server';





// export const newReceiver = async (req: Request, res: Response) => {

//     const data = req.body as Receiver;



//     const rp = await receivers.newReciver(data);
//     // @ts-ignore
//     // examples.new(id, req.io);

//     // try {
//     //     const a = await SerialPort.list().then((ports) => ports).catch(err => `${err}`);
//     //     if (typeof a === 'string') {
//     //         return res.json({
//     //             error: a
//     //         })
//     //     }
//     //     return res.json({
//     //         a
//     //     })

//     // } catch (error) {
//     //     console.log(error);
//     // }


//     res.json({
//         msg: rp
//     })


// }


// export const deleteReceiver = async (req: Request, res: Response) => {
//     // const { id } = req.params;

//     await receivers.deleteReceiver('devttyUSB1');
//     res.json({
//         msg: true
//     })
// }