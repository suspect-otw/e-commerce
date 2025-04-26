import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getProducts } from "../actions/products";
import ProductManager from "../components/ProductManager";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch products
  const products = await getProducts();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <span className="font-medium">Admin Dashboard</span> - Manage your T-shirt products here
        </div>
      </div>
      
      <ProductManager initialProducts={products} />
    </div>
  );
}

