import { Router, IRouter } from "express";
import { signup, login, forgotPassword, resetPassword, socialAuth } from '..//controllers/authController'
import passport from "passport";

const router: IRouter = Router()

router.post('/signup', signup)

router.post('/login', login)

router.patch('/forgotPassword', forgotPassword)

router.patch('/resetPassword/:token', resetPassword)

//GOOGLE OAUTH
router.get('/google', passport.authenticate('google'))

//OAUTH CALLBACKS
router.get('/google/callback', passport.authenticate('google'), socialAuth)

export default router