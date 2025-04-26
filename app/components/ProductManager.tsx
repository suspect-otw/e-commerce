'use client';

import { useState } from 'react';
import { Product, createProduct, updateProduct } from '../actions/products';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import { useRouter } from 'next/navigation';

interface ProductManagerProps {
  initialProducts: Product[];
}

export default function ProductManager({ initialProducts }: ProductManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleCreateSubmit = async (formData: FormData) => {
    const result = await createProduct(formData);
    if (result.success) {
      setIsCreating(false);
      router.refresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleUpdateSubmit = async (formData: FormData) => {
    const result = await updateProduct(formData);
    if (result.success) {
      setEditingProduct(null);
      router.refresh();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        {!isCreating && !editingProduct && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add New Product
          </button>
        )}
      </div>

      {(isCreating || editingProduct) && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isCreating ? 'Add New Product' : 'Edit Product'}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingProduct(null);
              }}
              className="px-3 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/90"
            >
              Cancel
            </button>
          </div>

          {isCreating ? (
            <ProductForm
              onSubmit={handleCreateSubmit}
              formType="create"
            />
          ) : (
            editingProduct && (
              <ProductForm
                onSubmit={handleUpdateSubmit}
                initialData={editingProduct}
                formType="edit"
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
        }}
      />
    </div>
  );
} 