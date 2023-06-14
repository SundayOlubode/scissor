import { Document, Schema, model } from 'mongoose';

interface USER extends Document {
    email: string;
    firstname: string;
    lastname: string;
    createdAt: string;
    passwordResetExpiry: string;
    passwordToken: string;
}

const userSchema = new Schema<USER>({
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
    createdAt: {
        type: String,
        required: true
    },
    passwordToken: String,
    passwordResetExpiry: Date,
});

const Users = model<USER>('User', userSchema);
export default Users;
