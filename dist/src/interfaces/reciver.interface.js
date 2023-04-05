"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusSender = exports.TypeSender = exports.Status = void 0;
var Status;
(function (Status) {
    Status[Status["connect"] = 1] = "connect";
    Status[Status["disconnect"] = 2] = "disconnect";
    Status[Status["error"] = 3] = "error";
})(Status = exports.Status || (exports.Status = {}));
var TypeSender;
(function (TypeSender) {
    TypeSender[TypeSender["withOutServer"] = 1] = "withOutServer";
    TypeSender[TypeSender["withServer"] = 2] = "withServer";
    TypeSender[TypeSender["withClient"] = 3] = "withClient";
})(TypeSender = exports.TypeSender || (exports.TypeSender = {}));
var StatusSender;
(function (StatusSender) {
    StatusSender[StatusSender["start"] = 1] = "start";
    StatusSender[StatusSender["stop"] = 2] = "stop";
    StatusSender[StatusSender["connecting"] = 3] = "connecting";
})(StatusSender = exports.StatusSender || (exports.StatusSender = {}));
//# sourceMappingURL=reciver.interface.js.map