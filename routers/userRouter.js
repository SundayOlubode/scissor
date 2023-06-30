"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorize_1 = __importDefault(require("../middlewares/authorize"));
const urlRouter_1 = __importDefault(require("./urlRouter"));
const router = (0, express_1.Router)();
router.use(authorize_1.default);
router.use('/url', urlRouter_1.default);
exports.default = router;
