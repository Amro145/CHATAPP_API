import mongoose from 'mongoose';
import User from "./auth.model.js";

const friendRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending'
    },
    message: {
        type: String,
        default: "has sent you a friend request"
    }
}, { timestamps: true });

export const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);