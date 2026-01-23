// ⚠️ This is a SAFE auth page - uses direct fetch, no apiClient or useLogin hooks
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { setAuthTokens } from "@/lib/api/client";

// ✅ Define schema locally - no external imports that cause issues
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered") === "true";
  const reset = searchParams?.get("reset") === "true";
  const returnUrl = searchParams?.get("returnUrl") || AUTH_CONFIG.defaultRedirect;

  // ✅ Use local state instead of useMutation
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Use direct fetch(), NOT apiClient
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...data,
          tenantId: AUTH_CONFIG.defaultTenantId,
        }),
        credentials: "include", // ✅ Send cookies
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || `Login failed (${response.status})`);
      }

      const result = await response.json();

      // Check for MFA requirement
      if (result.requiresMfa) {
        window.location.href = `/mfa?token=${result.mfaToken}`;
        return;
      }

      const accessToken = result?.data?.accessToken as string | undefined;
      const refreshToken = result?.data?.refreshToken as string | undefined;
      const expiresIn = result?.data?.expiresIn as number | undefined;

      if (accessToken) {
        setAuthTokens({ accessToken, refreshToken, expiresIn });
      }

      // ✅ Use window.location, NOT router.push()
      window.location.href = returnUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          {registered && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>
                Registration successful! Please check your email to verify your account.
              </AlertDescription>
            </Alert>
          )}

          {reset && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>
                Password reset successfully! Please login with your new password.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="login-email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        disabled={isLoading}
                        value={field.value as string}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="login-password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        value={field.value as string}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
