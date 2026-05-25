import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const fallbackArt = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="24" fill="#20232a"/>
  <circle cx="60" cy="60" r="28" fill="#3b82f6"/>
  <path d="M50 46h16c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H50c-2.2 0-4-1.8-4-4V50c0-2.2 1.8-4 4-4Zm3 3v18h10V49H53Zm-5 5v8h4v-8h-4Z" fill="#f8fafc"/>
  <path d="M78 40c2.8 0 5 2.2 5 5v30c0 2.8-2.2 5-5 5" fill="none" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
</svg>
`)}`;

export const Upload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) {
      setFile(null);
      setError("");
      return;
    }

    if (!selected.type.startsWith("audio/")) {
      setFile(null);
      setError("Only audio files are allowed.");
      return;
    }

    setFile(selected);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an audio file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosInstance.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setUploads((prev) => [res.data.upload, ...prev]);
      setFile(null);
      setError("");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err?.response?.data?.message || "Failed to upload file.");
    }
  };

  useEffect(() => {
    axiosInstance.get("/api/upload")
      .then((res) => setUploads(res.data.uploads || []))
      .catch((err) => console.error("Failed to fetch uploads:", err));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/upload/${id}`);
      setUploads((prev) => prev.filter((upload) => upload._id !== id));
    } catch (err) {
      console.error("Delete upload failed:", err);
    }
  };

  return (
    <div className="upload-shell">
      <div>
        <p className="eyebrow">Upload audio</p>
        <h2 className="section-title">Add a file to your library</h2>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="field-label">
          <span>Select audio file</span>
          <input
            type="file"
            accept="audio/*"
            className="glass-file-input"
            onChange={handleFileChange}
          />
        </label>

        <button
          type="submit"
          disabled={!file || Boolean(error)}
          className="glass-button glass-button-primary"
        >
          Upload
        </button>
      </form>

      {error && <p className="status-error">{error}</p>}

      <div>
        <h3 className="section-subtitle">Your uploads</h3>
        {uploads.length > 0 ? (
          <ul className="upload-list">
            {uploads.map((upload) => (
              <li key={upload._id} className="upload-row glass-card">
                <img
                  src={upload.coverArt || fallbackArt}
                  alt={upload.filename || 'Album art'}
                  className="upload-thumb"
                />
                <div className="upload-meta">
                  <strong>{upload.filename}</strong>
                  <p className="muted-copy">Ready to play</p>
                </div>
                <button
                  type="button"
                  className="glass-button glass-button-secondary"
                  onClick={() => handleDelete(upload._id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted-copy">You have no uploads.</p>
        )}
      </div>
    </div>
  );
};
