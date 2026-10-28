import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    liked: {
        type: Boolean,
        default: false
    },
    lastOpen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Project = mongoose.model("Project", projectSchema);

export default Project
