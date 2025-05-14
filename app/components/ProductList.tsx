'use client';

import { useState } from 'react';
import { Product, deleteProduct } from '../actions/products';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
}

export default function ProductList({ products, onEdit }: ProductListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleDelete = async (id: string) => {
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
      setProductToDelete(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <p className="text-muted-foreground">No products found. Add your first product!</p>
      </div>
    );
  }

  // Action buttons that appear in both mobile and desktop views
  const ActionButtons = ({ product }: { product: Product }) => (
    <div className="flex space-x-2">
      <button
        onClick={() => onEdit(product)}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Pencil className="h-4 w-4" />
        <span className="sm:inline">Edit</span>
      </button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="flex items-center gap-1 px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
            onClick={() => setProductToDelete(product)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sm:inline">Delete</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              product &quot;{productToDelete?.name}&quot; and remove the data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => productToDelete && handleDelete(productToDelete.id)}
              disabled={isDeleting !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting === productToDelete?.id ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  // Product image component that's reused in both views
  const ProductImage = ({ product }: { product: Product }) => (
    product.image_url && product.image_url.length > 0 ? (
      <div className="relative h-16 w-16">
        <Image
          src={product.image_url[0]}
          alt={product.name}
          className="object-cover rounded"
          fill
          sizes="64px"
          onError={(e) => {
            // @ts-expect-error - TypeScript doesn't know about the src property on the target
            e.target.src = 'https://placehold.co/100x100/png?text=No+Image';
          }}
        />
        {product.image_url.length > 1 && (
          <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs px-1 rounded-sm z-10">
            +{product.image_url.length - 1}
          </span>
        )}
      </div>
    ) : (
      <div className="h-16 w-16 bg-muted flex items-center justify-center rounded">
        <span className="text-xs text-muted-foreground">No image</span>
      </div>
    )
  );

  return (
    <div>
      {/* Mobile view - Cards */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <ProductImage product={product} />
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm">{product.size} - ${product.price}</p>
              </div>
            </div>
            
            {product.description && (
              <div className="mb-3 text-sm text-muted-foreground">
                {product.description.substring(0, 100)}
                {product.description.length > 100 ? '...' : ''}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mb-3">
              Added: {new Date(product.created_at).toLocaleDateString()}
            </div>
            
            <ActionButtons product={product} />
          </div>
        ))}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-3 text-left border">Image</th>
              <th className="p-3 text-left border">Name</th>
              <th className="p-3 text-left border">Description</th>
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
                  <ProductImage product={product} />
                </td>
                <td className="p-3 border">{product.name}</td>
                <td className="p-3 border">{product.description ? product.description.substring(0, 50) + (product.description.length > 50 ? '...' : '') : 'No description'}</td>
                <td className="p-3 border">{product.size}</td>
                <td className="p-3 border">${product.price}</td>
                <td className="p-3 border">
                  {new Date(product.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 border">
                  <ActionButtons product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 