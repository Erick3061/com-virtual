import { Router } from "express";
import { deleteReceiver, newReceiver } from "../controllers/receiver.controller";

const router = Router();

router.post('/', newReceiver);
router.get('/', deleteReceiver);


export default router;