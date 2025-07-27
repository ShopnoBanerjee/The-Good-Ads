'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const mode = searchParams.get('mode');
        const userType = searchParams.get('userType');
        const redirect = searchParams.get('redirect');

        // If there's a code, exchange it for session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Exchange error:", exchangeError);
            setError("Failed to authenticate. Please try again.");
            setTimeout(() => router.replace('/auth'), 3000);
            return;
          }
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          setError("Session error. Please try logging in again.");
          setTimeout(() => router.replace('/auth'), 3000);
          return;
        }

        // For signup flow
        if (mode === 'signup' && userType) {
          // Add a bypass flag to the URL to skip middleware check temporarily
          const registerUrl = `/register?userType=${userType}&fromCallback=true${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;
          window.location.href = registerUrl;
          return;
        }

        // Get user profile
        const user = session.user;
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        // Determine redirect destination
        let finalRedirect;
        if (redirect) {
          finalRedirect = redirect;
        } else if (profile?.user_type === 'business') {
          finalRedirect = '/dashboard/business';
        } else {
          finalRedirect = '/dashboard/college';
        }

        // Add bypass flag to skip middleware check temporarily
        const urlWithBypass = `${finalRedirect}?fromCallback=true`;
        
        // Use window.location.href for a full page reload
        window.location.href = urlWithBypass;
        
      } catch (err) {
        console.error("Callback error:", err);
        setError("An unexpected error occurred. Please try again.");
        setTimeout(() => router.replace('/auth'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div>
            <p className="text-lg text-red-600 mb-2">{error}</p>
            <p className="text-sm text-gray-600">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg">Logging you in...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
}