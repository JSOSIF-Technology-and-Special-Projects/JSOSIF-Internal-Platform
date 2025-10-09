// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserByCredentials } from '@/data/mockApi'; // adjust path if needed
import jsosifbanner from "../assets/jsosifbanner.png";
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      const user = await fetchUserByCredentials(email, password);
      console.log(user);
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === 'Admin') {
            router.push('/admin-dashboard');
        } else {
            router.push("/homepage");
        }
      } else {
        setError('Invalid email or password');
      }
    };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-[400px] sm:max-w-[600px] mx-auto mt-4 relative aspect-[3/1]">
        <Image
            src={jsosifbanner}
            alt="JSOSIF Banner"
            fill
            className="object-contain"
            priority
        />
        </div>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="border px-4 py-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border px-4 py-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Log In
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </main>
  );
}
