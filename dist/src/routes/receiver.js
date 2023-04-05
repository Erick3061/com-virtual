"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const receiver_controller_1 = require("../controllers/receiver.controller");
const router = (0, express_1.Router)();
router.post('/', receiver_controller_1.newReceiver);
router.get('/', receiver_controller_1.deleteReceiver);
exports.default = router;
//# sourceMappingURL=receiver.js.map