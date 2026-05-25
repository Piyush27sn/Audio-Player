import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    coverArt: { type: String, default: null },
    uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Upload", uploadSchema);