"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("..//controllers/authController");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.patch('/forgotPassword', authController_1.forgotPassword);
router.patch('/resetPassword/:token', authController_1.resetPassword);
//GOOGLE OAUTH
router.get('/google', passport_1.default.authenticate('google'));
//OAUTH CALLBACKS
router.get('/google/callback', passport_1.default.authenticate('google'), authController_1.socialAuth);
exports.default = router;
