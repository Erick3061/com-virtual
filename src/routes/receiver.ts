import 'reflect-metadata';
import { Router, Response, Request } from "express";
import { plainToClass } from "class-transformer";
import { ReceiverData, SenderData } from "../validation/receiver";
import { ValidationError, validate } from "class-validator";
import { Receivers } from '../controllers/receiver.controller';
import { getReceivers } from '../../view/src/api/Request';


export class ReceiverRouter {
    public router: Router;
    public recivers: Receivers;

    constructor(recivers: Receivers) {
        this.router = Router();
        this.recivers = recivers;
        this.setupRoutes();
    }

    private setupRoutes() {
        // * Create a new receiver
        this.router.post('/', async (req: Request, res: Response) => {

            const receiver = plainToClass(ReceiverData, req.body);
            const errors = await validate(receiver);


            if (errors.length > 0) {
                return res.status(400).json({
                    errors: errors.map(err => this.formatError(err))
                })
            }

            const { ack, attempt, com, delimiter, heartbeat, intervalAck, intervalHeart } = receiver;

            try {

                const rv = await this.recivers.newReciver({
                    ack,
                    attempt,
                    com,
                    delimiter,
                    heartbeat, intervalAck, intervalHeart
                });

                if (typeof rv === "string") {
                    return res.status(500).json({
                        error: rv
                    })
                }

                res.json({
                    rv: rv.getInformation()
                })

            } catch (error) {

                res.status(500).json({
                    msg: `${error}`
                })
            }
        })

        // * Get all 
        this.router.get('/', (req: Request, res: Response) => {
            res.json({
                rv: this.recivers.getAll()
            })
        })

        // * stop a receiver
        this.router.get('/stop/:id', async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                await this.recivers.stopReceiver(id);
                res.json({
                    msg: 'ok'
                })
            } catch (error) {
                res.status(500).json({
                    msg: error
                })
            }
        })

        // * start receiver
        this.router.get('/start/:id', async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                await this.recivers.startReceiver(id);
                res.json({
                    msg: 'ok'
                })
            } catch (error) {
                res.status(500).json({
                    msg: error
                })
            }
        })

        // * Remove receiver 
        this.router.delete('/:id', async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                await this.recivers.removeReciver(id);
                res.json({
                    msg: 'ok'
                })
            } catch (error) {
                res.json({
                    msg: error
                })
            }
        })

        this.router.post('/add-sender/:id', async (req: Request, res: Response) => {
            const { id } = req.params;
            const sender = plainToClass(SenderData, req.body);
            const errors = await validate(sender);

            if (errors.length > 0) {
                return res.json({
                    errors: errors.map(err => this.formatError(err))
                })
            }
            try {
                await this.recivers.addSender(id, sender);
                res.json({
                    msg: 'ok'
                })
            } catch (error) {
                res.json({
                    msg: `${error}`
                })
            }
        })

        this.router.get('/stop-sender/:id', async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                await this.recivers.stopSender(id);
                res.json({
                    msg: 'ok'
                })
            } catch (error) {
                res.json({
                    msg: `${error}`
                })
            }
        })
        this.router.get('/start-sender/:id', async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                await this.recivers.startSender(id);
                res.json({
                    msg: 'ok'
                })
            } catch (error) {
                res.json({
                    msg: `${error}`
                })
            }
        })

        this.router.delete('/sender/:id', async (req: Request, res: Response) => {
            const { id } = req.params;
            try {
                await this.recivers.deleteSender(id);
                res.json({
                    msg: 'ok'
                })
            } catch (error) {
                res.json({
                    msg: `${error}`
                })
            }
        })

    }

    private getErros(msg: {
        [type: string]: string;
    }) {
        return Object.values(msg);
    }

    private formatError(err: ValidationError) {
        if (err.children && err.children?.length > 0) {
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
