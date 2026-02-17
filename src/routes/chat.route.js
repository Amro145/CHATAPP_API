import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { getStreamToken } from '../controllers/chat.controller.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat integration (Stream)
 */

/**
 * @swagger
 * /chat/token:
 *   get:
 *     summary: Get Stream Chat token
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stream Chat token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get("/token", verifyToken, getStreamToken);

export default router;