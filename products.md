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

**Notes on the image field**:
- `image_url` is defined as TEXT ARRAY to store multiple image URLs for each product
- To handle images:
  1. Create a storage bucket in Supabase dashboard named "product-images"
  2. Upload images to this bucket
  3. Store the resulting URLs in the image_url array field
  4. Set appropriate storage bucket policies to restrict uploads to authenticated users
