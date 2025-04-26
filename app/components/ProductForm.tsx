'use client';

import { useState, useEffect } from 'react';
import { Product } from '../actions/products';
import ImageUpload from './ImageUpload';

interface ProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Product;
  formType: 'create' | 'edit';
}

export default function ProductForm({ onSubmit, initialData, formType }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [size, setSize] = useState(initialData?.size || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.image_url || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = (url: string) => {
    setImageUrls([...imageUrls, url]);
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
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
      if (formType === 'create') {
        // Reset form for create
        setName('');
        setSize('');
        setPrice('');
        setImageUrls([]);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <h2 className="text-xl font-bold mb-4">
        {formType === 'create' ? 'Add New Product' : 'Edit Product'}
      </h2>
      
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
        
        {imageUrls.length > 0 && (
          <div className="border rounded-md p-3 bg-muted/20">
            <h3 className="text-sm font-medium mb-2">
              {imageUrls.length} {imageUrls.length === 1 ? 'Image' : 'Images'} Attached
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-md border bg-muted">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="object-cover w-full h-full transition-all hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/png?text=No+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md opacity-90 hover:opacity-100"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <ImageUpload 
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