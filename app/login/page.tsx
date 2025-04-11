'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/catalog');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-gray-800" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-muted">
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}