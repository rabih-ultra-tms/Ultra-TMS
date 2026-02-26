// ⚠️ This is a SAFE auth page - uses direct fetch, no apiClient or useLogin hooks
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, LogIn, User, Lock, Eye, EyeOff, Info, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

function LoginPageContent() {
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered") === "true";
  const reset = searchParams?.get("reset") === "true";
  const returnUrl = searchParams?.get("returnUrl") || AUTH_CONFIG.defaultRedirect;

  // ✅ Use local state instead of useMutation
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Truck className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-sidebar-foreground">Ultra TMS</h2>
            <p className="text-sm text-sidebar-foreground/50">Transportation Management System</p>
          </div>
        </div>

        <Card className="w-full shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Access your transportation management dashboard
            </CardDescription>
          </CardHeader>

        <CardContent>
          {registered && (
            <Alert className="mb-4">
              <AlertDescription>
                Registration successful! Please check your email to verify your account.
              </AlertDescription>
            </Alert>
          )}

          {reset && (
            <Alert className="mb-4">
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="login-email" className="text-sm font-semibold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@company.com"
                          autoComplete="email"
                          disabled={isLoading}
                          className="pl-10 h-12"
                          value={field.value as string}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </div>
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
                    <div className="flex items-center justify-between">
                      <FormLabel htmlFor="login-password" className="text-sm font-semibold">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-primary hover:underline"
                        tabIndex={isLoading ? -1 : 0}
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="pl-10 pr-10 h-12"
                          value={field.value as string}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground font-medium cursor-pointer"
                >
                  Remember this session
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full h-12 font-semibold shadow-lg shadow-primary/25" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <LogIn className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start gap-3 bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/10">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="block font-semibold text-foreground mb-1">
                      Restricted Access
                    </span>
                    Self-registration is disabled. If you require access, please contact your system administrator.
                  </p>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center" />
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Truck className="h-7 w-7" />
              </div>
            </div>
            <Card className="w-full shadow-xl border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
                <CardDescription>Loading...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </React.Suspense>
  );
}
