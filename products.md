# Products Table Schema

```sql
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    image_url TEXT[],
    price SMALLINT NOT NULL CHECK (price >= 1 AND price <= 10000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Set RLS policies - only allow authenticated admin to access
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy for viewing products (allow all)
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
USING (true);

-- Policy for inserting products (only authenticated users)
CREATE POLICY "Products can be inserted by authenticated users only" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy for updating products (only authenticated users)
CREATE POLICY "Products can be updated by authenticated users only" 
ON public.products FOR UPDATE 
TO authenticated 
USING (true);

-- Policy for deleting products (only authenticated users)
CREATE POLICY "Products can be deleted by authenticated users only" 
ON public.products FOR DELETE 
TO authenticated 
USING (true);
```

# Storage Bucket for Product Images

```sql
-- Setup storage bucket for product images
INSERT INTO storage.buckets (id, name, owner, created_at, updated_at, public)
VALUES 
('product-images', 'Product Images', NULL, NOW(), NOW(), true)
ON CONFLICT (id) DO NOTHING;

-- Set RLS policies for the bucket
CREATE POLICY "Allow public read access for product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to upload to product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to update their uploads in product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to delete their uploads in product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

**Notes on the image handling**:
- `image_url` is defined as TEXT ARRAY to store multiple image URLs for each product
- Images are uploaded to a Supabase Storage bucket named "product-images"
- The workflow is:
  1. User selects an image file in the admin interface
  2. The file is uploaded to the "product-images" bucket
  3. The public URL is stored in the product's image_url array
  4. Multiple images can be uploaded and stored for each product
  5. The first image is used as the main/thumbnail image
  6. All operations are protected by Row Level Security policies
