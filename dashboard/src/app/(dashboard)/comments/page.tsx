'use client';

import { useState } from 'react';
import { useComments, useApproveComment, useEditComment, useRejectComment } from '@/hooks/useComments';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAccounts } from '@/hooks/useAccounts';
import { CheckCircle2, Clock, Download, ExternalLink, ThumbsUp, Eye, MessageCircle, X, Pencil, Check } from 'lucide-react';
import type { CommentRow } from '@/types';
import api from '@/lib/api';

type Tab = 'POSTED' | 'PENDING';

export default function CommentsPage() {
  const [tab, setTab] = useState<Tab>('POSTED');
  const [filters, setFilters] = useState<{
    workflowId?: string;
    accountId?: string;
    platform?: 'LINKEDIN' | 'TWITTER';
    startDate?: string;
    endDate?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: workflows = [] } = useWorkflows();
  const { data: accounts = [] } = useAccounts();
  const { data } = useComments({ tab, ...filters, page, limit });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const counts = data?.counts ?? { posted: 0, pending: 0 };

  function handleExport() {
    const params = new URLSearchParams();
    if (filters.workflowId) params.set('workflowId', filters.workflowId);
    if (filters.accountId) params.set('accountId', filters.accountId);
    if (filters.platform) params.set('platform', filters.platform);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    params.set('tab', tab);
    api
      .get('/comments/export', { params: Object.fromEntries(params), responseType: 'blob' })
      .then((r) => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'suprfly-comments.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Generated Comments</h1>

      <div className="grid grid-cols-2 rounded-xl bg-white border border-slate-200 p-1 gap-1">
        <TabButton active={tab === 'POSTED'} onClick={() => { setTab('POSTED'); setPage(1); }} icon={<CheckCircle2 className="w-4 h-4" />}>
          Posted <span className="text-slate-400">({counts.posted})</span>
        </TabButton>
        <TabButton active={tab === 'PENDING'} onClick={() => { setTab('PENDING'); setPage(1); }} icon={<Clock className="w-4 h-4" />}>
          Pending Review <span className="text-slate-400">({counts.pending})</span>
        </TabButton>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={filters.workflowId ?? ''}
            onChange={(e) => { setFilters({ ...filters, workflowId: e.target.value || undefined }); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
          >
            <option value="">All Workflows</option>
            {workflows.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select
            value={filters.accountId ?? ''}
            onChange={(e) => { setFilters({ ...filters, accountId: e.target.value || undefined }); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.platformUsername}</option>)}
          </select>
          <select
            value={filters.platform ?? ''}
            onChange={(e) => { setFilters({ ...filters, platform: (e.target.value || undefined) as any }); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
          >
            <option value="">All Platforms</option>
            <option value="TWITTER">X (Twitter)</option>
            <option value="LINKEDIN">LinkedIn</option>
          </select>
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700"
          />
          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700"
          />
          <button
            onClick={handleExport}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Export Comments
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
              <th className="text-left font-bold py-3">Workflow</th>
              <th className="text-left font-bold py-3">Target</th>
              <th className="text-left font-bold py-3">Your Comment</th>
              {tab === 'POSTED' ? <th className="text-left font-bold py-3">Stats</th> : <th className="text-left font-bold py-3">Actions</th>}
              <th className="text-left font-bold py-3">Date</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400 text-xs py-12">No comments yet.</td></tr>
            )}
            {items.map((c) => (
              <CommentRow key={c.id} comment={c} tab={tab} />
            ))}
          </tbody>
        </table>

        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
                className="px-2 py-1 rounded border border-slate-200 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-slate-500">per page</span>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-2 py-1 rounded border border-slate-200 text-xs disabled:opacity-30">←</button>
              {Array.from({ length: Math.min(4, pagination.totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${p === page ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages} className="px-2 py-1 rounded border border-slate-200 text-xs disabled:opacity-30">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      {icon}{children}
    </button>
  );
}

function CommentRow({ comment, tab }: { comment: CommentRow; tab: Tab }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.commentText);
  const approve = useApproveComment();
  const edit = useEditComment();
  const reject = useRejectComment();

  const hasStats = comment.statsLastPolledAt !== null;
  const dateLabel = comment.postedAt
    ? new Date(comment.postedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : new Date(comment.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <tr className="border-t border-slate-100">
      <td className="py-4 max-w-[200px]">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={comment.platform} />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">{comment.workflow.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{comment.account.platformUsername}</div>
          </div>
        </div>
      </td>
      <td className="py-4 max-w-[140px]">
        <div className="text-xs text-slate-600 truncate">
          {comment.post.matchType === 'CREATOR' ? `@${comment.post.matchValue}` : comment.post.matchValue}
        </div>
        <div className="text-[10px] text-slate-400 truncate">{comment.post.authorName}</div>
      </td>
      <td className="py-4 max-w-[380px]">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full px-2 py-1.5 rounded border border-blue-200 text-xs focus:outline-none focus:border-blue-400"
          />
        ) : (
          <div className="text-xs text-slate-600 line-clamp-3">{comment.commentText}</div>
        )}
        {comment.isEdited && <div className="mt-1 text-[10px] text-amber-600">edited</div>}
      </td>
      {tab === 'POSTED' ? (
        <td className="py-4">
          {hasStats ? (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {comment.likesCount}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {comment.repliesCount}</span>
              <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {comment.viewsCount}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400">No stats yet</span>
          )}
        </td>
      ) : (
        <td className="py-4">
          <div className="flex items-center gap-1.5">
            {!editing ? (
              <>
                <button onClick={() => approve.mutate(comment.id)} title="Approve & post" className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditing(true)} title="Edit" className="p-1.5 rounded text-slate-500 hover:bg-slate-100">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => reject.mutate({ id: comment.id })} title="Reject" className="p-1.5 rounded text-red-500 hover:bg-red-50">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    edit.mutate({ id: comment.id, commentText: draft }, { onSuccess: () => setEditing(false) });
                  }}
                  className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setEditing(false); setDraft(comment.commentText); }} className="p-1.5 rounded text-slate-500 hover:bg-slate-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </td>
      )}
      <td className="py-4 text-xs text-slate-500">
        {comment.postedAt ? <span><span className="text-emerald-600 font-semibold">Posted</span> {dateLabel}</span> : dateLabel}
      </td>
      <td className="py-4">
        {comment.post.postUrl && (
          <a href={comment.post.postUrl} target="_blank" rel="noreferrer" className="inline-flex p-1.5 rounded text-blue-500 hover:bg-blue-50">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </td>
    </tr>
  );
}

function PlatformIcon({ platform }: { platform: 'LINKEDIN' | 'TWITTER' }) {
  return (
    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
      {platform === 'TWITTER' ? (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-700" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.97 6.817H1.673l7.73-8.834L1.254 2.25h6.831l4.713 6.231zm-1.16 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ) : (
        <span className="text-blue-700 font-bold text-[11px]">in</span>
      )}
    </div>
  );
}
