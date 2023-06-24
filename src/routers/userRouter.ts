import { Router, RequestHandler, IRouter } from "express";
import authorize from "../middlewares/authorize";
import urlRouter from './urlRouter'

const router: IRouter = Router()

router.use(authorize)

router.use('/url', urlRouter)

export default router