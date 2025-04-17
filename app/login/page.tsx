'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log(status)
    if (status === 'authenticated') {
      router.push('/catalog');
    }
  }, [status, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted backdrop-blur-sm flex-col gap-6">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* <div className="bg-primary rounded-full p-3">
            <KeyRound className="w-6 h-6 text-primary-foreground" />
          </div> */}
          <h1 className="text-2xl font-bold text-center">DIP</h1>
          <p className="text-muted-foreground text-center">
            Please sign in to access
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={() => signIn('keycloak', { callbackUrl: "/catalog" })}
          >
            Sign in
          </Button>
        </div>
        {/* <div className="mt-4 text-center text-sm">
          By{" "}
          <a href="https://www.paasup.io" target="_blank" className="underline underline-offset-4">
            PAASUP
          </a>
        </div> */}
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By{" "}
        <a href="https://www.paasup.io" target="_blank" className="underline underline-offset-4">
          PAASUP
        </a>.
      </div>
    </div>
  );
}
