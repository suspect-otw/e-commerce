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
    <div className="flex-1 w-full flex flex-col gap-4 px-2 py-4 sm:p-8 max-w-full overflow-hidden">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-4 rounded-md text-foreground flex flex-wrap gap-2 items-center">
          <span className="font-medium">Admin Dashboard</span> - Manage your T-shirt products here
        </div>
      </div>
      
      <ProductManager initialProducts={products} />
    </div>
  );
}

