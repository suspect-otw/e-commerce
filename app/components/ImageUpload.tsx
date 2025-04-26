'use client';

import { useState, useRef } from 'react';
import { uploadProductImage } from '../actions/storage';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onError: (error: string) => void;
}

export default function ImageUpload({ onImageUpload, onError }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setTotalFiles(files.length);
    setCompletedFiles(0);
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Preview (show only for the first file to avoid cluttering UI)
        if (i === 0) {
          const reader = new FileReader();
          reader.onload = (e) => {
            // No need to set preview for multiple files
          };
          reader.readAsDataURL(file);
        }
        
        // Upload the file
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await uploadProductImage(formData);
        
        if (result.error) {
          onError(`Error uploading ${file.name}: ${result.error}`);
          continue;
        }
        
        if (!result.publicUrl) {
          onError(`Failed to get public URL for ${file.name}`);
          continue;
        }
        
        // Add the uploaded image URL
        onImageUpload(result.publicUrl);
        
        // Update progress
        setCompletedFiles(prev => prev + 1);
        setUploadProgress(Math.floor(((i + 1) / files.length) * 100));
        
      } catch (error) {
        console.error('Upload error:', error);
        onError(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    
    // Reset states after all uploads
    setIsUploading(false);
    setUploadProgress(0);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex flex-col items-center gap-4 w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500 text-center">
              {isUploading 
                ? `Uploading... ${completedFiles}/${totalFiles} (${uploadProgress}%)`
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1 px-4 text-center">
              JPG, PNG, GIF (Select multiple files by holding Ctrl/Cmd)
            </p>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            multiple  // Enable multiple file selection
          />
        </label>
        
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
} 