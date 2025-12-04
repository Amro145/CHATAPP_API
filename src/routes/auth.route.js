import express from 'express';
import { checkAuth, deleteUser, forgotPassword, getAllUsers, logout, onboarding, resetPassword, signIn, signUp, verifyEmail } from '../controllers/auth.controller.js';
import { verifyToken } from '../../middleWare/verifyToken.js';

const router = express.Router();
router.post('/signup', signUp);
router.post('/verify-email', verifyEmail);
router.delete('/delete/:userId', deleteUser);
router.get('/getall', getAllUsers);
router.post('/signin', signIn);
router.post('/logout', logout);
router.delete('/delete/:userId', deleteUser);


router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetCode', resetPassword);
router.get('/check-auth', verifyToken, checkAuth);
router.post("/onboarding", verifyToken, onboarding);

export default router;