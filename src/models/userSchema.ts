import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    firstname: string;
    lastname: string;
    createdAt: string;
    password?: string;
    passwordResetExpiry: number | null;
    passwordToken: string | null;
    isValidPassword(password: string): boolean
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    createdAt: {
        type: String,
        required: true
    },
    passwordToken: String,
    passwordResetExpiry: Date,
});

export const Users = model<IUser>('User', userSchema);