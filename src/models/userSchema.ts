import { Document, Schema, model } from 'mongoose';
import HookNextFunction from 'mongoose'
import bcrypt from 'bcrypt'
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export interface IUser extends Document {
    username?: string;
    email: string;
    createdAt?: string;
    password?: string;
    passwordResetExpiry: number | null;
    passwordToken: string | null;
    googleId?: string;
    isValidPassword(password: string): boolean;
    createJwt(): string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    createdAt: {
        type: String
    },
    googleId: {
        type: String
    },
    passwordToken: String,
    passwordResetExpiry: Date,
});

userSchema.pre<IUser>("save", async function (next): Promise<void> {
    if (!this.password) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.createJwt = async function (): Promise<string> {
    return await jwt.sign({ user_id: this.id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES!,
    });
};

export const Users = model<IUser>('User', userSchema);