import { Document, Schema, model } from 'mongoose';
import HookNextFunction from 'mongoose'
import bcrypt from 'bcrypt'
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export interface IUser extends Document {
    email: string;
    firstname: string;
    lastname: string;
    createdAt?: string;
    password?: string;
    passwordResetExpiry: number | null;
    passwordToken: string | null;
    isValidPassword(password: string): boolean;
    createJwt(): string;
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