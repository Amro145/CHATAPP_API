import express from 'express';
import { acceptFriendRequest, getAllFriendRequests, getFriendRequests, getFriends, getOutgoingFriendRequests, getUser, sendFriendRequest, suggestedFriends } from '../controllers/user.controller.js';
import { verifyToken } from '../../middleware/verifyToken.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User social interactions
 */

/**
 * @swagger
 * /user/friends/{id}:
 *   get:
 *     summary: Get user's friends
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of friends
 *       404:
 *         description: User not found
 */
router.get('/friends/:id', verifyToken, getFriends);

/**
 * @swagger
 * /user/suggested:
 *   get:
 *     summary: Get suggested friends
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suggested users
 */
router.get('/suggested', verifyToken, suggestedFriends);

/**
 * @swagger
 * /user/profile/{id}:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 */
router.get('/profile/:id', verifyToken, getUser);

/**
 * @swagger
 * /user/send-friend-request/{id}:
 *   post:
 *     summary: Send a friend request
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to send request to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request sent
 *       400:
 *         description: Request already exists or invalid
 */
router.post('/send-friend-request/:id', verifyToken, sendFriendRequest);

/**
 * @swagger
 * /user/get-friends-request:
 *   get:
 *     summary: Get incoming friend requests
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of incoming friend requests
 */
router.get('/get-friends-request', verifyToken, getFriendRequests);

/**
 * @swagger
 * /user/accept-friend-request/{id}:
 *   post:
 *     summary: Accept a friend request
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the friend request
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request accepted
 *       404:
 *         description: Request not found
 */
router.post('/accept-friend-request/:id', verifyToken, acceptFriendRequest);

/**
 * @swagger
 * /user/get-outgoing-friend-requests:
 *   get:
 *     summary: Get outgoing friend requests
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of outgoing friend requests
 */
router.get('/get-outgoing-friend-requests', verifyToken, getOutgoingFriendRequests);

/**
 * @swagger
 * /user/get-all-friend-requests:
 *   get:
 *     summary: Get all friend requests (Admin/Debug)
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all friend requests system-wide
 */
router.get('/get-all-friend-requests', verifyToken, getAllFriendRequests);

export default router;