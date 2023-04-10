import 'reflect-metadata';
import { Router, Response, Request } from "express";
import { plainToClass } from "class-transformer";
import { ReceiverData } from "../validation/receiver";
import { ValidationError, validate } from "class-validator";
import { Receivers } from '../model/receivers';



export class ReceiverRouter {
    public router:Router;
    public recivers: Receivers;
    

    constructor(recivers: Receivers ){
        this.router = Router();
        this.recivers = recivers;
        this.setupRoutes();
    }

    private setupRoutes(){
        // * Create a new receiver
        this.router.post('/', async (req: Request, res: Response) => {

            const receiver = plainToClass(ReceiverData, req.body);
            const errors = await validate(receiver);
            
            if(errors.length > 0){
                return res.json({
                    errors: errors.map( err => this.formatError(err))
                })
            }

            const {ack,attempt, com, delimiter, heartbeat,intervalAck, intervalHeart, isServerSender, status} = receiver;
            

            const rv = await this.recivers.newReciver({
                ack,
                attempt, 
                com: {
                    baudRate: com.baudRate, 
                    path: com.path
                }, 
                delimiter, 
                heartbeat, intervalAck,intervalHeart, status
            });

            res.json({
                msg: rv
            })
        })

        // * Delete a receiver
    }

    private getErros(msg: {
        [type: string]: string;
    }){
        return Object.values(msg);
    }
    private formatError(err: ValidationError){
        if (err.children && err.children?.length > 0 ){
            return {
                property: err.children[0].property,
                msg: [
                    ...this.getErros(err.children[0].constraints || {})
                ]
            }
        }
        return {
            property: err.property,
            msg: [
                ...this.getErros(err.constraints || {})
            ]
        }
    }
}


// const router = Router();

// router.post('/', newReceiver);
// router.get('/', deleteReceiver);


// export default router;