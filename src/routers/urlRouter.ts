import { Router, RequestHandler, IRouter } from "express";
import { createUrl, editCusomUrl } from "../controllers/urlController";
import authorize from "../middlewares/authorize";

const router: IRouter = Router()

router.post('/create', authorize, createUrl)
router.patch('/edit', authorize, editCusomUrl)

export default router