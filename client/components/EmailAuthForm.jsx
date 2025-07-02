'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function EmailAuthForm({ mode, userType, method }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (method === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        setSuccess('Check your email for the link!');
      } else if (method === 'password') {
        if (mode === 'signup') {
          const { error } = await supabase.auth.signUp({
            email,
            password: '' // Add password logic if needed
          });
          if (error) throw error;
          setSuccess('Check your email for the link!');
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password: '' // Add password logic if needed
          });
          if (error) throw error;
          setSuccess('Check your email for the link!');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
      </button>
      {success && <p className="text-green-600 text-center">{success}</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}
    </form>
  );
}
