import { Schema, model, Model, Document } from 'mongoose';

export interface ILocation extends Document{
    shortUrl: string;
    location: string;
}

const locationSchema = new Schema<ILocation, Model<ILocation>, ILocation>({
    shortUrl: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    }
});

export const Locations = model<ILocation>('location', locationSchema);
