'use client';

import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const { status } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'authenticated') {
            setIsLayoutReady(true);
        } else {
            setIsLayoutReady(false);
        }
    }, [status]);

    if (pathname === '/login') {
        return <>{children}</>;
    }

    if (!isLayoutReady) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-gray-800" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-1">
                <Header />
                <div className="flex flex-1 overflow-hidden pt-12">
                    <Sidebar />
                    <main className="flex-1 overflow-x-auto bg-background">
                        <div className="container mx-auto max-w-7xl px-4">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}