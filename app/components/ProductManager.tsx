'use client';

import { useState } from 'react';
import { Product, createProduct, updateProduct } from '../actions/products';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import { useRouter } from 'next/navigation';
import { deleteProductImage } from '../actions/storage';

interface ProductManagerProps {
  initialProducts: Product[];
}

export default function ProductManager({ initialProducts }: ProductManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [tempUploadedImages, setTempUploadedImages] = useState<string[]>([]);

  const handleCreateSubmit = async (formData: FormData) => {
    const result = await createProduct(formData);
    if (result.success) {
      setIsCreating(false);
      setTempUploadedImages([]);
      router.refresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleUpdateSubmit = async (formData: FormData) => {
    const result = await updateProduct(formData);
    if (result.success) {
      setEditingProduct(null);
      setTempUploadedImages([]);
      router.refresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleAddTempImage = (url: string) => {
    setTempUploadedImages(prev => [...prev, url]);
  };

  const handleRemoveTempImage = (url: string) => {
    setTempUploadedImages(prev => prev.filter(item => item !== url));
  };

  const handleCancel = async () => {
    // Delete any temporary uploaded images
    if (tempUploadedImages.length > 0) {
      const deletePromises = tempUploadedImages.map(async (imageUrl) => {
        try {
          await deleteProductImage(imageUrl);
          return { url: imageUrl, success: true };
        } catch (error) {
          console.error(`Failed to delete temp image: ${imageUrl}`, error);
          return { url: imageUrl, success: false, error };
        }
      });

      await Promise.all(deletePromises);
    }

    // Reset the form state
    setIsCreating(false);
    setEditingProduct(null);
    setTempUploadedImages([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        {!isCreating && !editingProduct && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 w-full sm:w-auto"
          >
            Add New Product
          </button>
        )}
      </div>

      {(isCreating || editingProduct) && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">
              {isCreating ? 'Add New Product' : 'Edit Product'}
            </h2>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/90"
            >
              Cancel
            </button>
          </div>

          {isCreating ? (
            <ProductForm
              onSubmit={handleCreateSubmit}
              formType="create"
              onAddTempImage={handleAddTempImage}
              onRemoveTempImage={handleRemoveTempImage}
            />
          ) : (
            editingProduct && (
              <ProductForm
                onSubmit={handleUpdateSubmit}
                initialData={editingProduct}
                formType="edit"
                onAddTempImage={handleAddTempImage}
                onRemoveTempImage={handleRemoveTempImage}
              />
            )
          )}
        </div>
      )}

      <ProductList
        products={initialProducts}
        onEdit={(product) => {
          setIsCreating(false);
          setEditingProduct(product);
          setTempUploadedImages([]);
        }}
      />
    </div>
  );
} 