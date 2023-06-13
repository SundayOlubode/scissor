import { Document, Schema, model } from 'mongoose';

interface URL extends Document {
    longUrl: string;
    shortUrl: string;
    createdAt: string;
    expiresAt: string;
    userId?: string;
    count: number;
}

const urlSchema = new Schema<URL>({
    longUrl: {
        type: String, 
        required: true
    },
    shortUrl: {
        type: String, 
        required: true
    },
    createdAt: {
        type: String, 
        required: true
    },
    expiresAt: {
        type: String, 
        required: true
    },
    userId: {
        type: String
    },
    count: {
        type: Number, 
        required: true,
        default: 0
    },
});

const Urls = model<URL>('url', urlSchema);
export default Urls;
