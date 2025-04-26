'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '../actions/products';
import ImageUpload, { ImageUploadRef } from './ImageUpload';
import { deleteProductImage } from '../actions/storage';

interface ProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Product;
  formType: 'create' | 'edit';
  onCancel: () => void;
}

type UploadedImage = {
  url: string;
  filePath: string;
};

export default function ProductForm({ onSubmit, initialData, formType, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [size, setSize] = useState(initialData?.size || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const imageUploadRef = useRef<ImageUploadRef>(null);

  // Track if form is submitted or canceled
  const [isFormCompleted, setIsFormCompleted] = useState(false);

  // Extract URLs from tracked images
  const imageUrls = uploadedImages.map(img => img.url);

  // When editing, ensure we get all the latest images from the initialData
  useEffect(() => {
    if (initialData?.image_url) {
      // Convert to our internal format with dummy filePaths (existing images don't need cleanup)
      const initialImages = initialData.image_url.map(url => ({
        url,
        filePath: url.split('/').pop() || '' // Extract just the filename part
      }));
      setUploadedImages(initialImages);
    }
  }, [initialData]);

  // Cleanup effect when unmounting if form wasn't completed
  useEffect(() => {
    return () => {
      if (!isFormCompleted && imageUploadRef.current && uploadedImages.length > 0) {
        // Only perform cleanup for newly uploaded images (not ones from initialData)
        if (formType === 'create' || uploadedImages.some(img => !initialData?.image_url?.includes(img.url))) {
          console.log('Form cancelled, cleaning up temporary uploads');
          imageUploadRef.current.cleanup().catch(err => {
            console.error('Failed to cleanup temporary uploads:', err);
          });
        }
      }
    };
  }, [isFormCompleted, uploadedImages, formType, initialData]);

  const handleAddImage = (url: string, filePath: string) => {
    setUploadedImages(prev => [...prev, { url, filePath }]);
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    
    // For edit mode, also delete from storage
    if (formType === 'edit' && initialData?.id) {
      setIsDeleting(index);
      
      try {
        await deleteProductImage(imageToRemove.filePath);
      } catch (err) {
        console.error(`Failed to delete image from storage: ${imageToRemove.url}`, err);
        setError(`Failed to delete image from storage: ${err}`);
      } finally {
        setIsDeleting(null);
      }
    }
    
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!name || !size || !price) {
      setError('Name, size, and price are required');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    // Clear existing image_url values and add our current state
    const entries = Array.from(formData.entries());
    entries.forEach(([key]) => {
      if (key === 'image_url') {
        formData.delete(key);
      }
    });

    // Add image URLs
    imageUrls.forEach(url => {
      formData.append('image_url', url);
    });

    try {
      await onSubmit(formData);
      
      // Mark form as completed so we don't clean up on unmount
      setIsFormCompleted(true);
      
      if (formType === 'create') {
        // Reset form for create
        setName('');
        setSize('');
        setPrice('');
        setUploadedImages([]);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Mark form as completed to avoid double cleanup
    setIsFormCompleted(true);
    
    // Clean up any temporary uploads
    if (imageUploadRef.current && uploadedImages.length > 0) {
      // Only perform cleanup for newly uploaded images (not ones from initialData)
      if (formType === 'create' || uploadedImages.some(img => !initialData?.image_url?.includes(img.url))) {
        console.log('Form cancelled, cleaning up temporary uploads');
        imageUploadRef.current.cleanup().catch(err => {
          console.error('Failed to cleanup temporary uploads:', err);
        });
      }
    }
    
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {formType === 'create' ? 'Add New Product' : 'Edit Product'}
        </h2>
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/90"
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-destructive/20 text-destructive rounded-md">
          {error}
        </div>
      )}

      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="size" className="block text-sm font-medium">
          Size
        </label>
        <input
          type="text"
          id="size"
          name="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Enter size (e.g. 28, 30, S, M, L)"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="block text-sm font-medium">
          Price
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="1"
          max="10000"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Product Images
        </label>
        
        {uploadedImages.length > 0 && (
          <div className="border rounded-md p-3 bg-muted/20">
            <h3 className="text-sm font-medium mb-2">
              {uploadedImages.length} {uploadedImages.length === 1 ? 'Image' : 'Images'} Attached
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-md border bg-muted">
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="object-cover w-full h-full transition-all hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/png?text=No+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isDeleting === index}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md opacity-90 hover:opacity-100 disabled:opacity-50"
                      aria-label="Remove image"
                    >
                      {isDeleting === index ? '...' : '×'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <ImageUpload 
          ref={imageUploadRef}
          onImageUpload={handleAddImage}
          onError={(msg) => setError(msg)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : formType === 'create' ? 'Add Product' : 'Update Product'}
      </button>
    </form>
  );
} 