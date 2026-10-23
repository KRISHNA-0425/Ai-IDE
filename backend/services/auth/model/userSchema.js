import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    avatar: {
        type: String,
        default: ""
    },

}, { timestamps: true });


const User = mongoose.model("User", userSchema);