'use client';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useMe } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useMe();
  useAccounts();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
