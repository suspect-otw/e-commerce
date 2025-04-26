'use client';

import { useState } from 'react';
import { Product, deleteProduct } from '../actions/products';
import { useRouter } from 'next/navigation';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
}

export default function ProductList({ products, onEdit }: ProductListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(id);
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <p className="text-muted-foreground">No products found. Add your first product!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="p-3 text-left border">Image</th>
            <th className="p-3 text-left border">Name</th>
            <th className="p-3 text-left border">Size</th>
            <th className="p-3 text-left border">Price</th>
            <th className="p-3 text-left border">Created</th>
            <th className="p-3 text-left border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-muted/50">
              <td className="p-3 border">
                {product.image_url && product.image_url.length > 0 ? (
                  <div className="relative h-16 w-16">
                    <img
                      src={product.image_url[0]}
                      alt={product.name}
                      className="h-full w-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/png?text=No+Image';
                      }}
                    />
                    {product.image_url.length > 1 && (
                      <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs px-1 rounded-sm">
                        +{product.image_url.length - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-16 w-16 bg-muted flex items-center justify-center rounded">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </td>
              <td className="p-3 border">{product.name}</td>
              <td className="p-3 border">{product.size}</td>
              <td className="p-3 border">${product.price}</td>
              <td className="p-3 border">
                {new Date(product.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 border">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={isDeleting === product.id}
                    className="px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {isDeleting === product.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 