import { Router, RequestHandler, IRouter } from "express";
import { createUrl, editCusomUrl, getUrlAnalytics } from "../controllers/urlController";
import authorize from "../middlewares/authorize";

const router: IRouter = Router()

router.post('/create', authorize, createUrl)
router.patch('/edit', authorize, editCusomUrl)
router.get('/analytics', authorize, getUrlAnalytics)

export default router