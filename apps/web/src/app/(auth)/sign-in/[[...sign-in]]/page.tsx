// src/app/auth/sign-in/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white text-shadow-lg mb-6">
        Væro
      </h1>

      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none",
            headerTitle: "text-white text-2xl font-semibold text-center",
            headerSubtitle: "text-[var(--text-secondary)] text-center mb-6",
            formFieldInput:
              "input-weather w-full border border-white/25 focus:ring-[var(--weather-dark)] focus:border-transparent text-white",
            formButtonPrimary:
              "btn-primary w-full mt-4",
          },
        }}
        routing="path"
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
      />

      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        Ny bruker?{" "}
        <button
          onClick={() => router.push("/auth/sign-up")}
          className="text-white underline hover:text-gray-200"
        >
          Opprett konto
        </button>
      </p>
    </div>
  );
}
