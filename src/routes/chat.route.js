import express from 'express';
import { verifyToken } from '../../middleWare/verifyToken.js';
import { getStreamToken } from '../controllers/chat.controller.js';
const router = express.Router();

router.get("/token", verifyToken, getStreamToken);


export default router;