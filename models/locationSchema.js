"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locations = void 0;
const mongoose_1 = require("mongoose");
const locationSchema = new mongoose_1.Schema({
    shortUrl: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 1
    }
});
exports.Locations = (0, mongoose_1.model)('location', locationSchema);
