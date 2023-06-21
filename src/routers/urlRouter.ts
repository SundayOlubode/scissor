import { Router, RequestHandler, IRouter } from "express";
import { createUrl } from "../controllers/urlController";
import authorize from "../middlewares/authorize";

const router: IRouter = Router()

router.post('/create', authorize, createUrl)

export default router