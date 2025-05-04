"use server";

import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  success?: boolean;
  error?: string;
  filePath?: string;
  publicUrl: string;
  fileName?: string;
}

export const uploadProductImage = async (formData: FormData): Promise<UploadResult> => {
  const supabase = await createClient();
  
  // Get the file from form data
  const file = formData.get("file") as File;
  
  if (!file) {
    return { 
      error: "No file provided",
      publicUrl: ""
    };
  }
  
  // Generate a unique file name with the original extension
  const fileExt = file.name.split(".").pop() || "jpg";
  const uniqueId = uuidv4();
  const fileName = `${uniqueId}.${fileExt}`;
  const filePath = `${fileName}`;
  
  // Upload the file to the product-images bucket
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  
  if (error) {
    console.error("Error uploading file:", error);
    return { 
      error: error.message,
      publicUrl: ""
    };
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);
  
  return { 
    success: true, 
    filePath, 
    publicUrl,
    fileName
  };
};

export const deleteProductImage = async (filePath: string) => {
  const supabase = await createClient();
  
  // Extract just the filename if full URL is provided
  let fileName = filePath;
  if (filePath.includes('/')) {
    const parts = filePath.split('/');
    fileName = parts[parts.length - 1];
  }
  
  const { error } = await supabase.storage
    .from("product-images")
    .remove([fileName]);
  
  if (error) {
    console.error("Error deleting file:", error);
    return { error: error.message };
  }
  
  return { success: true };
}; 