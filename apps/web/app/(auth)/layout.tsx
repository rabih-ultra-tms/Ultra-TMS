import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Ultra TMS",
  description: "Sign in to your Ultra TMS account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Ultra TMS</h1>
          <p className="mt-2 text-sm text-gray-600">
            Transportation Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
