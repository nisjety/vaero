// src/app/auth/sign-up/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white text-shadow-lg mb-6">
        Væro
      </h1>

      <SignUp
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
        redirectUrl="/"
      />

      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        Allerede medlem?{" "}
        <button
          onClick={() => router.push("/auth/sign-in")}
          className="text-white underline hover:text-gray-200"
        >
          Logg inn
        </button>
      </p>
    </div>
  );
}
