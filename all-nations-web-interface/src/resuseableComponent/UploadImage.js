import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import ipAddress from "../components/config";

const ImageUploader = ({ onUploadComplete }) => {
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState({});

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach(uploadImage);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const uploadImage = async (imgObj) => {
    const formData = new FormData();
    formData.append("image", imgObj.file);

    try {
      const response = await axios.post(`${ipAddress}/upload_image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress((prev) => ({ ...prev, [imgObj.file.name]: percent }));
        },
      });

      if (response.data !== "unsuccesful") {
        onUploadComplete(response.data); // Pass uploaded URL(s) to parent
      } else {
        alert("⚠️ Upload failed. Try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Error uploading image.");
    }
  };

  const removeImage = (file) => {
    setImages((prev) => prev.filter((img) => img.file !== file));
  };

  return (
    <div
      {...getRootProps()}
      className="border border-warning rounded p-3 text-center"
      style={{
        borderStyle: "dashed",
        background: "#fffaf5",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-warning">Drop your images here...</p>
      ) : (
        <p>Drag & drop or click to choose files</p>
      )}

      <div className="row mt-3">
        {images.map((img, i) => (
          <div className="col-6 col-md-4 mb-3" key={i}>
            <div className="position-relative">
              <img
                src={img.preview}
                alt=""
                className="img-fluid rounded border"
                style={{ height: "120px", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removeImage(img.file)}
                className="btn btn-sm btn-danger position-absolute top-0 end-0"
              >
                ×
              </button>
              <div className="progress mt-1">
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{
                    width: `${progress[img.file.name] || 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;