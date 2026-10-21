"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full p-6 bg-white border-4 border-black shadow-brutal">
      <h2 className="text-xl font-black text-black mb-4 text-center">SIGN IN / SIGN UP</h2>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Enter your email and password to sign in. If you don't have an account yet, we'll create one for you automatically.
      </p>
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          
          // Try sign in first, if it fails, try sign up
          formData.set("flow", "signIn");
          void signIn("password", formData).catch((error) => {
            // If sign in fails, try sign up
            if (error.message.includes("Invalid password")) {
              toast.error("Invalid password. Please try again.");
              setSubmitting(false);
            } else {
              // Try sign up
              formData.set("flow", "signUp");
              void signIn("password", formData).catch((signUpError) => {
                toast.error("Could not create account. Please try again.");
                setSubmitting(false);
              });
            }
          });
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? "Processing..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
