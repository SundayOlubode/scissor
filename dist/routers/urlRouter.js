"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const urlController_1 = require("../controllers/urlController");
const authorize_1 = __importDefault(require("../middlewares/authorize"));
const router = (0, express_1.Router)();
router.post('/create', authorize_1.default, urlController_1.createUrl);
router.patch('/edit', authorize_1.default, urlController_1.editCusomUrl);
router.patch('/analytics', authorize_1.default, urlController_1.getUrlAnalytics);
exports.default = router;
