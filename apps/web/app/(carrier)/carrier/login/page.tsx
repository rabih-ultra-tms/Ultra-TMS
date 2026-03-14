import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LoginForm } from '@/components/carrier/LoginForm';
import Link from 'next/link';

export default function CarrierLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Carrier Portal
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />

          <div className="mt-6 space-y-2 text-center text-sm">
            <div>
              <Link href="#" className="text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div>
              Don't have an account?{' '}
              <Link href="#" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
