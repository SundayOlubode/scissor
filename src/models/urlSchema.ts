import { Schema, model, Model } from 'mongoose';

export interface IUser {
    longUrl: string;
    shortUrl: string;
    createdAt: number;
    expiresAt: number;
    userId?: string;
    count?: number;
    isCustom?: boolean
}

const urlSchema = new Schema<IUser, Model<IUser>, IUser>({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
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

export const Urls = model<IUser>('url', urlSchema);
