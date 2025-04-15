import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { ClientLayoutWrapper } from '@/components/client-layout-wrapper';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DIP',
  description: 'DIP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><Script src="/runtime-env.js" strategy="beforeInteractive"></Script></head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}


// <AuthProvider>
//   <div className="flex h-screen overflow-hidden">
//     <div className="flex flex-col flex-1">
//       <Header />
//       <div className="flex flex-1 overflow-hidden pt-12">
//         <Sidebar />
//         <main className="flex-1 overflow-y-auto bg-background">
//           <div className="container mx-auto max-w-7xl px-4">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   </div>
// </AuthProvider>

// <AuthProvider>
//   <ClientLayoutWrapper>
//     {children}
//   </ClientLayoutWrapper>
// </AuthProvider>