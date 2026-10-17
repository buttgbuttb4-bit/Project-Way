import React, { useState, useRef, useEffect } from 'react';
import { uploads } from '../api/teacherPanelApi';
import '../styles/Upload.css';

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const fileInputRef = useRef(null);

  // Helper function to capitalize first word
  const capitalizeFirstWord = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  useEffect(() => {
    // Load upload history from backend
    const loadUploadHistory = async () => {
      try {
        const result = await uploads.getAllUploads();
        if (result.success) {
          setUploadedFiles(result.uploads || []);
        }
      } catch (error) {
        console.error('Error loading upload history:', error);
      }
    };

    loadUploadHistory();
  }, []);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file sizes (max 5MB per file)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum file size is 5MB.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      announcement: announcement || 'No announcement',
      uploadDate: new Date().toLocaleString()
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    const selectedFilesToUpload = Array.from(fileInputRef.current?.files || []);
    if (selectedFilesToUpload.length === 0) {
      alert('Please select files to upload first');
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    
    // Validate all files
    for (let file of selectedFilesToUpload) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds the 5MB limit.`);
        return;
      }
    }
    
    // Convert files to base64 for backend upload
    const filesToUpload = await Promise.all(selectedFilesToUpload.map(async file => {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      
      return {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type,
        url: base64, // Use base64 as URL for now
        announcement: announcement || 'No announcement',
        teacherName: 'Teacher'
      };
    }));
    
    // Upload files to backend
    try {
      alert(`Uploading ${selectedFilesToUpload.length} file(s)...`);
      
      for (const fileData of filesToUpload) {
        const result = await uploads.uploadFile(fileData);
        if (!result.success) {
          alert(`Error uploading ${fileData.name}: ${result.message}`);
          return;
        }
      }
      
      // Clear selected files and reload history
      setSelectedFiles([]);
      setAnnouncement('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload upload history from backend
      const historyResult = await uploads.getAllUploads();
      if (historyResult.success) {
        setUploadedFiles(historyResult.uploads || []);
      }
      
      alert('Upload completed successfully! Files are now available to students.');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files: ' + error.message);
    }
  };

  const handleAnnouncementChange = (e) => {
    const value = e.target.value;
    // Allow only letters and numbers
    const sanitized = value.replace(/[^a-zA-Z0-9\s]/g, '');
    // Capitalize first word
    setAnnouncement(capitalizeFirstWord(sanitized));
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const result = await uploads.deleteUpload(fileId);
      if (result.success) {
        // Reload upload history from backend
        const historyResult = await uploads.getAllUploads();
        if (historyResult.success) {
          setUploadedFiles(historyResult.uploads || []);
        }
        alert('File deleted successfully');
      } else {
        alert('Error deleting file: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFileSelect({ target: { files } });
  };

  const formatFileSize = (size) => {
    if (size === '0.00 MB') return '0 KB';
    return size;
  };

  return (
    <div className="u-page">
      <div className="u-box">
        {/* Left Side - Upload System */}
        <div className="u-left">
          <div className="u-head">
            <h2 className="u-title">Upload System</h2>
            <p className="u-sub">Share your materials with the Students</p>
          </div>

          {/* Announcement Section */}
          <div className="a-box">
            <label className="a-label">
              Announcement
            </label>
            <textarea
              value={announcement}
              onChange={handleAnnouncementChange}
              placeholder="Enter announcement text..."
              className="a-input"
            />
          </div>

          {/* File Upload Section */}
          <div className="u-set">
            <label className="u-label">
              Upload New Material
            </label>
            <div className="u-area">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="u-file"
              />
              <div 
                className="u-drop"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <span className="u-icon">📁</span>
                <p className="u-text">
                  Click to browse or drag and drop files here
                </p>
                <p className="u-subText">
                  Supported formats: PDF, PNG, JPG, DOC, DOCX (Max 5MB per file)
                </p>
              </div>
            </div>
            </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            className="u-btn u-primary"
            disabled={selectedFiles.length === 0}
          >
            <span className="u-btnIcon">⬆</span>
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
          </button>
        </div>

        {/* Right Side - Upload History */}
        <div className="u-right">
          <div className="h-head">
            <h3 className="h-title">Upload History</h3>
            <p className="h-sub">Recent uploads and materials</p>
          </div>

          <div className="h-list">
            {/* Selected Files */}
            {selectedFiles.map(file => (
              <div key={file.id} className="h-item h-selected">
                <div className="f-info">
                  <div className="f-icon">
                    {file.type.includes('pdf') ? '📄' : 
                     file.type.includes('image') ? '🖼️' : 
                     file.type.includes('doc') ? '📄' : '📎'}
                  </div>
                  <div className="f-details">
                    <h4 className="f-name">{file.name} <span className="h-badge">(Pending Upload)</span></h4>
                    <p className="f-note">{file.announcement}</p>
                    <p className="f-meta">
                      <span className="f-size">{formatFileSize(file.size)}</span>
                      <span className="f-date">{file.uploadDate}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== file.id))}
                  className="h-del"
                >
                  ✕
                </button>
              </div>
            ))}
            {/* Uploaded Files */}
            {uploadedFiles.length === 0 && selectedFiles.length === 0 ? (
              <div className="h-empty">
                <span className="h-emptyIcon">📂</span>
                <p className="h-emptyText">No uploads yet</p>
                <p className="h-emptySub">Start by uploading your first material</p>
              </div>
            ) : (
              uploadedFiles.map(file => (
                <div key={file.id} className="h-item">
                  <div className="f-info">
                    <div className="f-icon">
                      {file.type.includes('pdf') ? '📄' : 
                       file.type.includes('image') ? '🖼️' : 
                       file.type.includes('doc') ? '📄' : '📎'}
                    </div>
                    <div className="f-details">
                      <h4 className="f-name">{file.name}</h4>
                      <p className="f-note">{file.announcement}</p>
                      <p className="f-meta">
                        <span className="f-size">{formatFileSize(file.size)}</span>
                        <span className="f-date">{file.uploadDate}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
