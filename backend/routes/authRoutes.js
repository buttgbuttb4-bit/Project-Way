import express from 'express';
import { login, checkUser, getUserGroup, getUserSession } from '../controllers/authController.js';

const router = express.Router();
router.post('/login', login);
router.get('/check-user/:name', checkUser);
router.get('/user-group/:name', getUserGroup);
router.get('/user-session/:name', getUserSession);

export default router;
