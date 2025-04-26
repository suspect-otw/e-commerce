'use client';

import { useEffect, useState } from 'react';
import { 
  Product, 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../actions/products';
import ProductForm from './ProductForm';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowPathIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get search params for potential filter
  const searchParams = useSearchParams();
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (formData: FormData) => {
    try {
      await createProduct(formData);
      setShowAddForm(false);
      loadProducts();
    } catch (err) {
      console.error('Failed to create product:', err);
      throw err; // Let the form handle the error
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    try {
      await updateProduct(formData);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to update product:', err);
      throw err; // Let the form handle the error
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteAlert(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setShowDeleteAlert(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
  };

  const cancelAddNew = () => {
    setShowAddForm(false);
  };

  // Filter products if size is specified in URL
  const size = searchParams.get('size');
  const filteredProducts = size 
    ? products.filter(p => p.size.toLowerCase() === size.toLowerCase())
    : products;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Products {size ? `(Size: ${size})` : ''}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={loadProducts}
            className="p-2 bg-muted rounded-full hover:bg-muted/90"
            aria-label="Refresh"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          {!showAddForm && !editingProduct && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-destructive/20 text-destructive rounded-md flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="text-destructive" aria-label="Dismiss">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6">
          <ProductForm 
            onSubmit={handleCreateProduct} 
            formType="create" 
            onCancel={cancelAddNew}
          />
        </div>
      )}

      {editingProduct && (
        <div className="mb-6">
          <ProductForm 
            onSubmit={handleUpdateProduct} 
            initialData={editingProduct} 
            formType="edit" 
            onCancel={cancelEdit}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-8 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden bg-card">
              <div className="aspect-video relative bg-muted">
                {product.image_url && product.image_url.length > 0 ? (
                  <img
                    src={product.image_url[0]}
                    alt={product.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/png?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    No Image
                  </div>
                )}
                {product.image_url && product.image_url.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white px-2 py-1 text-xs rounded">
                    +{product.image_url.length - 1} more
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1">{product.name}</h3>
                <p className="text-sm mb-2">Size: {product.size}</p>
                <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setEditingProduct(product)}
                    disabled={editingProduct !== null || showAddForm}
                    className="flex items-center gap-1 py-1 px-3 bg-muted text-muted-foreground rounded-md hover:bg-muted/90 disabled:opacity-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => confirmDelete(product)}
                    disabled={editingProduct !== null || showAddForm}
                    className="flex items-center gap-1 py-1 px-3 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;{productToDelete?.name}&quot; and remove its images from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 