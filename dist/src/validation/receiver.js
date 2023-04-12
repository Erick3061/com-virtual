"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderData = exports.ReceiverData = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ReceiverData {
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => COM)
], ReceiverData.prototype, "com", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], ReceiverData.prototype, "ack", void 0);
__decorate([
    (0, class_validator_1.IsInt)()
], ReceiverData.prototype, "attempt", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], ReceiverData.prototype, "delimiter", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], ReceiverData.prototype, "heartbeat", void 0);
__decorate([
    (0, class_validator_1.IsInt)()
], ReceiverData.prototype, "intervalAck", void 0);
__decorate([
    (0, class_validator_1.IsInt)()
], ReceiverData.prototype, "intervalHeart", void 0);
exports.ReceiverData = ReceiverData;
class COM {
}
__decorate([
    (0, class_validator_1.IsInt)()
], COM.prototype, "baudRate", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], COM.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsIn)([5, 6, 7, 8]),
    (0, class_validator_1.IsOptional)()
], COM.prototype, "databits", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)()
], COM.prototype, "highWaterMark", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["none", "even", "odd", "mark", "space"]),
    (0, class_validator_1.IsOptional)()
], COM.prototype, "parity", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)()
], COM.prototype, "rtscts", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["handshake", "enable", "toggle"]),
    (0, class_validator_1.IsOptional)()
], COM.prototype, "rtsMode", void 0);
__decorate([
    (0, class_validator_1.IsIn)([1, 2, 1.5])
], COM.prototype, "stopBits", void 0);
class SenderData {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)()
], SenderData.prototype, "ip", void 0);
__decorate([
    (0, class_validator_1.IsInt)()
], SenderData.prototype, "port", void 0);
exports.SenderData = SenderData;
//# sourceMappingURL=receiver.js.map