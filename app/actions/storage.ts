"use server";

import { createClient } from "@/utils/supabase/server";

export const uploadProductImage = async (formData: FormData) => {
  const supabase = await createClient();
  
  // Get the file from form data
  const file = formData.get("file") as File;
  
  if (!file) {
    return { error: "No file provided" };
  }
  
  // Generate a unique file name with the original extension
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;
  
  // Upload the file to the product-images bucket
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  
  if (error) {
    console.error("Error uploading file:", error);
    return { error: error.message };
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);
  
  return { success: true, filePath, publicUrl };
};

export const deleteProductImage = async (filePath: string) => {
  const supabase = await createClient();
  
  const { error } = await supabase.storage
    .from("product-images")
    .remove([filePath]);
  
  if (error) {
    console.error("Error deleting file:", error);
    return { error: error.message };
  }
  
  return { success: true };
}; 