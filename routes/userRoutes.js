import express from 'express';
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/checkUserAuth.js';
const router = express.Router();

//public routes
router.post('/register' , UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.post('/send-password-reset-email', UserController.sendResetPasswordEmail);
router.post('/reset-password/:userId/:token', UserController.resetUserPasswordWithLink)
//protected routes
router.post('/changepassword', checkUserAuth ,UserController.resetUserPassword)

export default router;