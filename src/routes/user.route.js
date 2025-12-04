import express from 'express';
import { acceptFriendRequest, getAllFriendRequests, getFriendRequests, getFriends, getOutgoingFriendRequests, getUser, sendFriendRequest, suggestedFriends } from '../controllers/user.controller.js';
import { verifyToken } from '../../middleWare/verifyToken.js';
const router = express.Router();

router.get('/friends/:id', verifyToken, getFriends);
router.get('/suggested', verifyToken, suggestedFriends);
router.get('/profile/:id', verifyToken, getUser);

router.post('/send-friend-request/:id', verifyToken, sendFriendRequest);
router.get('/get-friends-request', verifyToken, getFriendRequests);
router.post('/accept-friend-request/:id', verifyToken, acceptFriendRequest);
router.get('/get-outgoing-friend-requests', verifyToken, getOutgoingFriendRequests);
router.get('/get-all-friend-requests', verifyToken, getAllFriendRequests);



export default router;