import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    picture: { type: String },
    nickname: { type: String, default: '' }
});

export default mongoose.model('User', userSchema);