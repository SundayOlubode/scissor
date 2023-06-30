import { Schema, model, Model, Document } from 'mongoose';

export interface ILocation extends Document{
    shortUrl: string;
    location: string;
    count: number;
}

const locationSchema = new Schema<ILocation, Model<ILocation>, ILocation>({
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

export const Locations = model<ILocation>('location', locationSchema);
