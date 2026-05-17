'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err) {
      setError((err instanceof Error ? err.message : '') || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Create your account</h2>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-cyan-600 font-semibold hover:underline">Log in</Link>
        </div>
      </CardContent>
    </Card>
  );
}
