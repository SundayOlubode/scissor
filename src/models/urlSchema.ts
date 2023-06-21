import { Schema, model, Model, Document } from 'mongoose';

export interface IUrl extends Document{
    longUrl: string;
    shortUrl: string;
    createdAt: number;
    expiresAt: number;
    userId?: string;
    count?: number;
    isCustom?: boolean;
    // save?(): void
}

const urlSchema = new Schema<IUrl, Model<IUrl>, IUrl>({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Number,
        required: true
    },
    userId: {
        type: String
    },
    isCustom: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0
    },
});

export const Urls = model<IUrl>('url', urlSchema);
