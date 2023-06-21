import { Router, IRouter } from "express";
import { signup, login, forgotPassword, resetPassword } from '..//controllers/authController'

const router: IRouter = Router()

router.post('/signup', signup)

router.post('/login', login)

router.patch('/forgotPassword', forgotPassword)

router.patch('/resetPassword/:token', resetPassword)

export default router