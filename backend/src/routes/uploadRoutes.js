import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { verifyToken } from "../middleware/auth.js";
import Upload from "../models/Upload.js";
import { extractCoverArt } from "../utils/coverArt.js";

const router = express.Router();

const audioFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
    } else {
        cb(new Error("Only audio files are allowed."), false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage, fileFilter: audioFileFilter });

router.post("/", verifyToken, upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Only audio files are allowed." });
    }

    try {
        const coverArt = await extractCoverArt(req.file.path);
        const newUpload = await Upload.create({
            userId: req.user.id,
            filename: req.file.originalname,
            fileUrl: `uploads/${req.file.filename}`,
            coverArt
        });
        res.json({ message: "File uploaded successfully", upload: newUpload });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Failed to upload file" });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const uploads = await Upload.find({ userId: req.user.id });
        const uploadsWithCoverArt = await Promise.all(
            uploads.map(async (upload) => {
                if (upload.coverArt) {
                    return upload;
                }

                const coverArt = await extractCoverArt(upload.fileUrl);

                if (!coverArt) {
                    return upload;
                }

                upload.coverArt = coverArt;
                await upload.save();
                return upload;
            })
        );

        res.json({ uploads: uploadsWithCoverArt });
    } catch (err) {
        console.error("Fetch uploads error:", err);
        res.status(500).json({ message: "Failed to fetch uploads" });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);
        if (!upload) {
            return res.status(404).json({ message: "Upload not found" });
        }
        if (upload.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this upload" });
        }

        const filePath = upload.fileUrl.replace(/\\/g, "/");
        await Upload.findByIdAndDelete(req.params.id);

        if (filePath) {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Failed to delete upload file:", unlinkErr);
                }
            });
        }

        res.json({ message: "Upload deleted successfully", id: req.params.id });
    } catch (err) {
        console.error("Delete upload error:", err);
        res.status(500).json({ message: "Failed to delete upload" });
    }
});

export default router;