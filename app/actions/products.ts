"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { deleteProductImage } from "./storage";

export type Product = {
  id: string;
  name: string;
  size: string;
  image_url: string[];
  price: number;
  created_at: string;
  updated_at: string;
};

export const getProducts = async (): Promise<Product[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  
  return data || [];
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }
  
  return data;
};

export const createProduct = async (formData: FormData) => {
  const supabase = await createClient();
  
  const name = formData.get("name") as string;
  const size = formData.get("size") as string;
  const price = parseInt(formData.get("price") as string);
  const imageUrls = formData.getAll("image_url").map(url => url.toString()).filter(url => url.trim() !== "");
  
  if (!name || !size || isNaN(price)) {
    return { error: "Name, size and price are required" };
  }
  
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name,
        size,
        price,
        image_url: imageUrls
      }
    ])
    .select();
  
  if (error) {
    console.error("Error creating product:", error);
    return { error: error.message };
  }
  
  return { success: true, data };
};

export const updateProduct = async (formData: FormData) => {
  const supabase = await createClient();
  
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const size = formData.get("size") as string;
  const price = parseInt(formData.get("price") as string);
  const imageUrls = formData.getAll("image_url").map(url => url.toString()).filter(url => url.trim() !== "");
  
  if (!id || !name || !size || isNaN(price)) {
    return { error: "ID, name, size and price are required" };
  }
  
  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      size,
      price,
      image_url: imageUrls
    })
    .eq("id", id)
    .select();
  
  if (error) {
    console.error("Error updating product:", error);
    return { error: error.message };
  }
  
  return { success: true, data };
};

export const deleteProduct = async (id: string) => {
  const supabase = await createClient();
  
  // First, get the product to get its image URLs
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();
  
  if (fetchError) {
    console.error("Error fetching product for deletion:", fetchError);
    return { error: fetchError.message };
  }

  // Delete the product
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting product:", error);
    return { error: error.message };
  }

  // Delete associated images from storage if they exist
  if (product?.image_url && product.image_url.length > 0) {
    for (const imageUrl of product.image_url) {
      try {
        // Extract file path from the URL
        // Assuming URL format is like: https://[bucket-url]/storage/v1/object/public/product-images/[filename]
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        if (fileName) {
          await deleteProductImage(fileName);
        }
      } catch (err) {
        console.error(`Failed to delete image: ${imageUrl}`, err);
        // Continue with other images even if one fails
      }
    }
  }
  
  return { success: true };
}; 