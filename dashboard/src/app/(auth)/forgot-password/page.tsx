'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err) || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-sm text-slate-500 mb-6">We sent a password reset link to <strong>{email}</strong></p>
          <Link href="/login" className="text-cyan-600 font-semibold text-sm hover:underline">Back to login</Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Reset your password</h2>
        <p className="text-sm text-slate-500 mb-6">Enter your email and we&apos;ll send you a reset link.</p>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-slate-400 hover:text-slate-600">Back to login</Link>
        </div>
      </CardContent>
    </Card>
  );
}
