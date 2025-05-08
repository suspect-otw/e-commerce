import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

//this page is will be used by me only for demo purposes in the netlify
//the smtp server will be setted up in supabase for demo site
//so even if you reset or forgot your password for test user in netlify app the smtp server will be sent it to me
//this will be for me to create new user if needed
//and preventing the bad intentions of the users who will try to change the password

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="text-center p-6 bg-card rounded-lg shadow-sm">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <form className="w-full p-6 bg-card rounded-lg shadow-sm">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <Label htmlFor="password" className="mt-2">Password</Label>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          minLength={6}
          required
        />
        <SubmitButton 
          className="mt-2" 
          formAction={signUpAction} 
          pendingText="Signing up..."
        >
          Sign up
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
