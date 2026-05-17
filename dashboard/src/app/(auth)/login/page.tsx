'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError((err instanceof Error ? err.message : '') || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Welcome back</h2>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          <Button type="submit" loading={loading} className="w-full">Log In</Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500 space-y-2">
          <p>Don&apos;t have an account? <Link href="/register" className="text-cyan-600 font-semibold hover:underline">Sign up</Link></p>
          <p><Link href="/forgot-password" className="text-slate-400 hover:text-slate-600">Forgot password?</Link></p>
        </div>
      </CardContent>
    </Card>
  );
}
