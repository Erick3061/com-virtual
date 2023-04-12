"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiverRouter = void 0;
require("reflect-metadata");
const express_1 = require("express");
const class_transformer_1 = require("class-transformer");
const receiver_1 = require("../validation/receiver");
const class_validator_1 = require("class-validator");
class ReceiverRouter {
    constructor(recivers) {
        this.router = (0, express_1.Router)();
        this.recivers = recivers;
        this.setupRoutes();
    }
    setupRoutes() {
        // * Create a new receiver
        this.router.post('/', async (req, res) => {
            const receiver = (0, class_transformer_1.plainToClass)(receiver_1.ReceiverData, req.body);
            const errors = await (0, class_validator_1.validate)(receiver);
            if (errors.length > 0) {
                return res.json({
                    errors: errors.map(err => this.formatError(err))
                });
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
                    return res.json({
                        error: rv
                    });
                }
                res.json({
                    rv: rv.getInformation()
                });
            }
            catch (error) {
                res.json({
                    msg: `${error}`
                });
            }
        });
        // * Get all 
        this.router.get('/', (req, res) => {
            res.json({
                rv: this.recivers.getAll()
            });
        });
        // * stop a receiver}
        this.router.get('/stop/:id', async (req, res) => {
            const { id } = req.params;
            try {
                await this.recivers.stopReceiver(id);
                res.json({
                    msg: 'ok'
                });
            }
            catch (error) {
                res.json({
                    msg: error
                });
            }
        });
        // * start receiver
        this.router.get('/start/:id', async (req, res) => {
            const { id } = req.params;
            try {
                await this.recivers.startReceiver(id);
                res.json({
                    msg: 'ok'
                });
            }
            catch (error) {
                res.json({
                    msg: error
                });
            }
        });
        // * Remove receiver 
        this.router.delete('/:id', async (req, res) => {
            const { id } = req.params;
            try {
                await this.recivers.removeReciver(id);
                res.json({
                    msg: 'ok'
                });
            }
            catch (error) {
                res.json({
                    msg: error
                });
            }
        });
        this.router.post('/add-sender/:id', async (req, res) => {
            const receiver = (0, class_transformer_1.plainToClass)(receiver_1.SenderData, req.body);
            const errors = await (0, class_validator_1.validate)(receiver);
            if (errors.length > 0) {
                return res.json({
                    errors: errors.map(err => this.formatError(err))
                });
            }
            res.json({
                msg: 'ok'
            });
        });
    }
    getErros(msg) {
        return Object.values(msg);
    }
    formatError(err) {
        if (err.children && err.children?.length > 0) {
            return {
                property: err.children[0].property,
                msg: [
                    ...this.getErros(err.children[0].constraints || {})
                ]
            };
        }
        return {
            property: err.property,
            msg: [
                ...this.getErros(err.constraints || {})
            ]
        };
    }
}
exports.ReceiverRouter = ReceiverRouter;
//# sourceMappingURL=receiver.js.map