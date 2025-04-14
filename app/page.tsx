import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      redirect('/catalog');
    }
  }, [status]);

  return null;
}