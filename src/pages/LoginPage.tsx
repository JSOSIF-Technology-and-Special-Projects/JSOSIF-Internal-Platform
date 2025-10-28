// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import jsosifbanner from '../assets/jsosifbanner.png';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPending(true);

    try {
      // 1) Ensure a Supabase auth user exists (server-only service key)
      await fetch("/api/auth/jit", { method: "POST", body: JSON.stringify({ email, password }) });
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      // 2) Sign in via Supabase Auth
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setError(`Sign-in failed: ${signInErr.message}`); // you'll see the real reason next time
        return;
      }


      // 3) Get role from your app profile table (id == auth user id)
      const userId = signInData.user?.id;
      let role = 'User';
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')                // <-- make sure this table exists with columns: id uuid PK, role text
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        if (profile?.role) role = profile.role;
      }

      // 4) Route like before
      if (role === 'Admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/homepage');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-[400px] sm:max-w-[600px] mx-auto mt-4 relative aspect-[3/1]">
        <Image src={jsosifbanner} alt="JSOSIF Banner" fill className="object-contain" priority />
      </div>
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="border px-4 py-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="border px-4 py-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={pending}
        >
          {pending ? 'Logging in…' : 'Log In'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </main>
  );
}
