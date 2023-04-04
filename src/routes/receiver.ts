import { Router } from "express";
import { newReceiver } from "../controllers/receiver.controller";

const router = Router();

router.post('/', newReceiver);


export default router;