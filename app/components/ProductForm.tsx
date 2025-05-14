'use client';

import { useState, useEffect } from 'react';
import { Product } from '../actions/products';
import ImageUpload from './ImageUpload';
import { deleteProductImage } from '../actions/storage';
import Image from 'next/image';
import { Textarea } from "@/components/ui/textarea";

interface ProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Product;
  formType: 'create' | 'edit';
  onAddTempImage: (url: string) => void;
  onRemoveTempImage: (url: string) => void;
}

export default function ProductForm({ 
  onSubmit, 
  initialData, 
  formType,
  onAddTempImage,
  onRemoveTempImage
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [size, setSize] = useState(initialData?.size || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.image_url || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // When editing, ensure we get all the latest images
  useEffect(() => {
    if (initialData?.image_url) {
      setImageUrls(initialData.image_url);
    }
    if (initialData?.description) {
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleAddImage = (url: string) => {
    setImageUrls(prev => [...prev, url]);
    
    // Track newly uploaded image if it's not already part of the initial data
    if (!initialData?.image_url?.includes(url)) {
      onAddTempImage(url);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = imageUrls[index];
    
    // For edit mode, also delete from storage if it was part of the original product
    if (formType === 'edit' && initialData?.id && initialData?.image_url?.includes(imageUrl)) {
      setIsDeleting(index);
      
      try {
        await deleteProductImage(imageUrl);
      } catch (err) {
        console.error(`Failed to delete image from storage: ${imageUrl}`, err);
        setError(`Failed to delete image from storage: ${err}`);
      } finally {
        setIsDeleting(null);
      }
    } else if (!initialData?.image_url?.includes(imageUrl)) {
      // If it's a newly uploaded image that wasn't part of the initial data
      // Track it for removal when canceling the form
      onRemoveTempImage(imageUrl);
    }
    
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
        setDescription('');
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
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg bg-card">
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

      {/* Responsive grid for form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 col-span-1 sm:col-span-2">
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

        <div className="space-y-2 col-span-1 sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            className="w-full min-h-[100px]"
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
            placeholder="e.g. 28, 30, S, M, L"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="transition-all hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      onError={(e) => {
                        // @ts-expect-error - TypeScript doesn't know about the src property on the target
                        e.target.src = 'https://placehold.co/100x100/png?text=No+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isDeleting === index}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md opacity-90 hover:opacity-100 disabled:opacity-50 z-10"
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
          onImageUpload={handleAddImage}
          onError={(msg) => setError(msg)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-base font-medium"
      >
        {isSubmitting ? 'Submitting...' : formType === 'create' ? 'Add Product' : 'Update Product'}
      </button>
    </form>
  );
} 