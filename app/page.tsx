import Hero from "@/components/hero";

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex items-center justify-center flex-col gap-6 px-4 ">
        <h2 className="font-medium text-xl mb-4">Welcome Page</h2>
      </main>
    </>
  );
}
