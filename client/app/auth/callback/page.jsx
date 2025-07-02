'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const mode = searchParams.get('mode');
      const userType = searchParams.get('userType');
      if (mode === 'signup' && userType) {
        router.replace(`/register?userType=${userType}`);
        return;
      }
      // login flow
      const user = session.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      if (profile?.user_type === 'business') {
        router.replace('/dashboard/business');
      } else {
        router.replace('/dashboard/college');
      }
    };
    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Logging you in...</p>
    </div>
  );
}

