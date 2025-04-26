'use client';

import { useState, useRef } from 'react';
import { uploadProductImage } from '../actions/storage';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onError: (error: string) => void;
}

export default function ImageUpload({ onImageUpload, onError }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadProductImage(formData);
      
      if (result.error) {
        onError(result.error);
        return;
      }
      
      onImageUpload(result.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      onError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs text-gray-500">
              {isUploading ? 'Uploading...' : 'Upload'}
            </p>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        
        {preview && (
          <div className="relative h-32 w-32 border rounded">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
} 