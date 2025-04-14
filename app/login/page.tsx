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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-primary rounded-full p-3">
            <KeyRound className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-center">DIP</h1>
          <p className="text-muted-foreground text-center">
            Please sign in to access DIP
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={() => signIn('keycloak')}
          >
            Sign in with Keycloak
          </Button>
        </div>
      </Card>
    </div>
  );
}

// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/components/auth-provider';
// import { LoginForm } from "@/components/login-form"

// export default function LoginPage() {
//   const { isAuthenticated, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && isAuthenticated) {
//       router.replace('/catalog');
//     }
//   }, [isAuthenticated, loading, router]);

//   if (loading) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
//         <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-gray-800" />
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-muted">
//       <div className="flex h-screen w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
//         <div className="flex w-full max-w-sm flex-col gap-6">
//           <LoginForm />
//         </div>
//       </div>
//     </div>
//   );
// }

// // 'use client';

// // import { useEffect } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { useAuth } from '@/components/auth-provider';

// // export default function LoginPage() {
// //   const { isAuthenticated, loading } = useAuth();
// //   const router = useRouter();

// //   useEffect(() => {
// //     if (!loading && isAuthenticated) {
// //       router.replace('/');
// //     }
// //   }, [isAuthenticated, loading, router]);

// //   if (loading) {
// //     return <div>Loading...</div>;
// //   }

// //   return (
// //     <div className="flex min-h-screen items-center justify-center">
// //       <div className="text-center">
// //         <h1 className="text-2xl font-bold mb-4">Redirecting to login...</h1>
// //         <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
// //       </div>
// //     </div>
// //   );
// // }