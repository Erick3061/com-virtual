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
            const { ack, attempt, com, delimiter, heartbeat, intervalAck, intervalHeart, isServerSender, status } = receiver;
            const rv = await this.recivers.newReciver({
                ack,
                attempt,
                com,
                delimiter,
                heartbeat, intervalAck, intervalHeart, status
            });
            res.json({
                msg: rv
            });
        });
        // * Delete a receiver
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