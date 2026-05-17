'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccounts } from '@/hooks/useAccounts';
import { useTones } from '@/hooks/useTones';
import {
  useWorkflows, useWorkflow, useCreateWorkflow, useUpdateWorkflow,
  useDeleteWorkflow, useToggleWorkflow,
  useAddKeyword, useDeleteKeyword, useAddCreator, useDeleteCreator,
} from '@/hooks/useWorkflows';
import { useGlobalQuota } from '@/hooks/useAnalytics';
import type {
  CommentLength, CommentTone, ConnectedAccount, QuotaSnapshot, Tone,
  Workflow, WorkflowKeyword, WorkflowCreator,
} from '@/types';
import {
  Search, Users, MessageSquare, Smile, Sparkles, Plus, Trash2, Save,
  RotateCcw, Play, Pause, ExternalLink, ArrowRightLeft,
} from 'lucide-react';

const COMMENT_TONES: { value: CommentTone; label: string }[] = [
  { value: 'ENERGETIC', label: 'Energetic — Punchy, dynamic, straight to point' },
  { value: 'PROFESSIONAL_TONE', label: 'Professional — Polished, considered' },
  { value: 'CASUAL', label: 'Casual — Friendly, informal' },
  { value: 'WITTY', label: 'Witty — Light humor, clever' },
  { value: 'EMPATHETIC', label: 'Empathetic — Warm, acknowledging' },
  { value: 'THOUGHTFUL', label: 'Thoughtful — Reflective, deeper' },
];

const COMMENT_LENGTHS: { value: CommentLength; label: string }[] = [
  { value: 'SHORT', label: '30-40 words (Short)' },
  { value: 'MEDIUM', label: '50-70 words (Medium)' },
  { value: 'LONG', label: '100-140 words (Long)' },
];

const LANGUAGES = [
  { value: 'en-US', label: '🇺🇸 English (US)' },
  { value: 'en-GB', label: '🇬🇧 English (UK)' },
  { value: 'es-ES', label: '🇪🇸 Spanish' },
  { value: 'fr-FR', label: '🇫🇷 French' },
  { value: 'de-DE', label: '🇩🇪 German' },
  { value: 'pt-BR', label: '🇧🇷 Portuguese' },
  { value: 'hi-IN', label: '🇮🇳 Hindi' },
];

const TIMEZONES = [
  'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin',
  'Asia/Singapore', 'Australia/Sydney', 'UTC',
];

export default function WorkflowsPage() {
  return (
    <Suspense fallback={null}>
      <WorkflowsInner />
    </Suspense>
  );
}

function WorkflowsInner() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const { data: workflows = [] } = useWorkflows();
  const { data: accounts = [] } = useAccounts();
  const { data: tones = [] } = useTones();
  const { data: quota } = useGlobalQuota();

  const [selectedIdState, setSelectedId] = useState<string | null>(initialId);
  const selectedId = selectedIdState ?? workflows[0]?.id ?? null;

  const { data: workflow } = useWorkflow(selectedId);
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();
  const toggleWorkflow = useToggleWorkflow();

  function handleCreate() {
    if (accounts.length === 0 || tones.length === 0) {
      alert('Connect at least one account and create at least one tone first.');
      return;
    }
    const name = prompt('Workflow name?');
    if (!name) return;
    createWorkflow.mutate(
      { accountId: accounts[0].id, toneId: tones[0].id, name },
      { onSuccess: (resp) => setSelectedId(resp.data.id) },
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 self-start">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900">List of Workflows</h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{workflows.length}</span>
          </div>
          <div className="text-xs text-slate-500 mb-4">Create and set up your workflow</div>

          <div className="space-y-2">
            {workflows.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors ${selectedId === w.id ? 'bg-blue-50 border border-blue-100' : 'border border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={w.account?.platform ?? 'TWITTER'} />
                  <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{w.name}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${w.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {w.isActive ? '● Active' : '○ Off'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3" />
                  {w.dailyLimit} comments / day
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add a new Workflow
          </button>
        </div>

        {workflow ? (
          <WorkflowForm
            key={workflow.id}
            workflow={workflow}
            accounts={accounts}
            tones={tones}
            quota={quota}
            onSave={(patch) => updateWorkflow.mutate({ id: workflow.id, ...patch })}
            onDelete={() => {
              if (confirm(`Delete workflow "${workflow.name}"?`)) {
                deleteWorkflow.mutate(workflow.id);
                setSelectedId(null);
              }
            }}
            onToggle={(active) => toggleWorkflow.mutate({ id: workflow.id, active })}
          />
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-sm text-slate-400">
            Select or create a workflow
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowForm({
  workflow, accounts, tones, quota, onSave, onDelete, onToggle,
}: {
  workflow: Workflow;
  accounts: ConnectedAccount[];
  tones: Tone[];
  quota: QuotaSnapshot | undefined;
  onSave: (patch: Partial<Workflow>) => void;
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: workflow.name,
    accountId: workflow.accountId,
    toneId: workflow.toneId,
    targetType: workflow.targetType,
    timezone: workflow.timezone,
    autoPost: workflow.autoPost,
    language: workflow.language,
    commentTone: workflow.commentTone,
    emojiEnabled: workflow.emojiEnabled,
    commentLength: workflow.commentLength,
    dailyLimit: workflow.dailyLimit,
  });

  const accountQuota = useMemo(
    () => quota?.accounts?.find((a) => a.accountId === form.accountId),
    [quota, form.accountId],
  );
  const accountUsed = accountQuota?.used ?? 0;
  const accountMax = accountQuota?.max ?? 50;
  const remainingForAccount = Math.max(0, accountMax - accountUsed);

  function handleSave() { onSave(form); }
  function handleReset() {
    setForm({
      name: workflow.name,
      accountId: workflow.accountId,
      toneId: workflow.toneId,
      targetType: workflow.targetType,
      timezone: workflow.timezone,
      autoPost: workflow.autoPost,
      language: workflow.language,
      commentTone: workflow.commentTone,
      emojiEnabled: workflow.emojiEnabled,
      commentLength: workflow.commentLength,
      dailyLimit: workflow.dailyLimit,
    });
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Label icon={<Sparkles className="w-3.5 h-3.5" />}>Workflow Name</Label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="ml-4 flex items-center gap-2">
          <button
            onClick={() => onToggle(!workflow.isActive)}
            className={`inline-flex items-center justify-center w-12 h-7 rounded-full transition-colors ${workflow.isActive ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <span className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${workflow.isActive ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
          </button>
          <button
            onClick={() => onToggle(!workflow.isActive)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Row label="Target Type" desc="Choose whether to target posts by keywords or by specific creators.">
        <div className="grid grid-cols-2 rounded-xl bg-slate-50 p-1 gap-1">
          <button
            onClick={() => setForm({ ...form, targetType: 'KEYWORD' })}
            className={`py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 ${form.targetType === 'KEYWORD' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Search className="w-4 h-4" /> Target Keywords
          </button>
          <button
            onClick={() => setForm({ ...form, targetType: 'CREATOR' })}
            className={`py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 ${form.targetType === 'CREATOR' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Users className="w-4 h-4" /> Target Creators
          </button>
        </div>
      </Row>

      <Row label="Select Account" desc="Choose where you want to publish your AI-generated comments.">
        <select
          value={form.accountId}
          onChange={(e) => setForm({ ...form, accountId: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.platform === 'TWITTER' ? '𝕏' : 'in'} {a.platformUsername} ({a.workflows?.length ? `${a.workflows.length} workflows` : 'no workflows'}) — 50 comments/day max
            </option>
          ))}
        </select>
      </Row>

      <Row label="Select a Tone" desc="This workflow will use the selected tone's identity and tone.">
        <select
          value={form.toneId}
          onChange={(e) => setForm({ ...form, toneId: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
        >
          {tones.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </Row>

      <Row label="Timezone *" desc="Select the timezone for this workflow.">
        <select
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
        >
          {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </Row>

      <Row label="Review & Approve" desc="When enabled, AI comments will wait for your review before posting. You can edit, approve or reject each comment.">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setForm({ ...form, autoPost: !form.autoPost })}
            className={`inline-flex items-center justify-center w-12 h-7 rounded-full transition-colors ${form.autoPost ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <span className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${form.autoPost ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
          </button>
          <span className="text-xs font-medium text-slate-500">{form.autoPost ? 'Auto-post' : 'Manual review'}</span>
        </div>
      </Row>

      <Row label="Language" desc="Select the language for this workflow.">
        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
        >
          {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </Row>

      <Row label="Comment Tone" desc="Choose how you want your comments to sound." icon={<MessageSquare className="w-3.5 h-3.5" />}>
        <select
          value={form.commentTone}
          onChange={(e) => setForm({ ...form, commentTone: e.target.value as CommentTone })}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
        >
          {COMMENT_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Row>

      <Row label="Emoji Usage" desc="Enable or disable emoji usage in your content." icon={<Smile className="w-3.5 h-3.5" />}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setForm({ ...form, emojiEnabled: !form.emojiEnabled })}
            className={`inline-flex items-center justify-center w-12 h-7 rounded-full transition-colors ${form.emojiEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <span className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${form.emojiEnabled ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
          </button>
          <span className="text-xs font-medium text-slate-500">{form.emojiEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </Row>

      <Row label="Comment Length" desc="Choose the preferred length for your comments.">
        <select
          value={form.commentLength}
          onChange={(e) => setForm({ ...form, commentLength: e.target.value as CommentLength })}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
        >
          {COMMENT_LENGTHS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </Row>

      {form.targetType === 'KEYWORD' ? (
        <KeywordsEditor workflowId={workflow.id} keywords={workflow.keywords ?? []} maxKeywords={5} />
      ) : (
        <CreatorsEditor workflowId={workflow.id} creators={workflow.creators ?? []} maxCreators={20} platform={workflow.account?.platform ?? 'TWITTER'} />
      )}

      <Row label="Comments By Day" desc={`Each account can post maximum ${accountMax} comments per day. ${remainingForAccount} comments remaining for this account.`}>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={50}
            value={form.dailyLimit}
            onChange={(e) => setForm({ ...form, dailyLimit: parseInt(e.target.value, 10) })}
            className="flex-1 h-1.5 rounded-full accent-blue-500"
          />
          <div className="w-12 text-center text-sm font-bold text-blue-600">{form.dailyLimit}</div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0</span><span>50</span></div>
      </Row>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onClick={onDelete} className="inline-flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-3.5 h-3.5" /> Delete workflow
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
          >
            <Save className="w-4 h-4" /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function KeywordsEditor({ workflowId, keywords, maxKeywords }: { workflowId: string; keywords: WorkflowKeyword[]; maxKeywords: number }) {
  const [input, setInput] = useState('');
  const addKeyword = useAddKeyword();
  const delKeyword = useDeleteKeyword();

  function handleAdd() {
    const k = input.trim();
    if (!k || keywords.length >= maxKeywords) return;
    addKeyword.mutate({ workflowId, keyword: k }, { onSuccess: () => setInput('') });
  }

  return (
    <Row
      label="Target Keywords"
      desc={`We'll target posts containing these keywords (published in the last 24h).`}
      right={<span className="text-[10px] text-slate-500">Add up to {maxKeywords} keywords, with ability to remove/edit.</span>}
    >
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Write keyword..."
          className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleAdd}
          disabled={keywords.length >= maxKeywords}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Add +
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <span key={k.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            {k.keyword}
            <a href={`https://twitter.com/search?q=${encodeURIComponent(k.keyword)}`} target="_blank" rel="noreferrer" className="hover:underline">
              <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={() => delKeyword.mutate({ workflowId, keywordId: k.id })} className="text-blue-400 hover:text-red-500">×</button>
          </span>
        ))}
      </div>
    </Row>
  );
}

function CreatorsEditor({
  workflowId, creators, maxCreators, platform,
}: { workflowId: string; creators: WorkflowCreator[]; maxCreators: number; platform: 'LINKEDIN' | 'TWITTER' }) {
  const [input, setInput] = useState('');
  const addCreator = useAddCreator();
  const delCreator = useDeleteCreator();

  function handleAdd() {
    const url = input.trim();
    if (!url || creators.length >= maxCreators) return;
    // Naive parse: take last path segment as profileId/username
    const m = url.match(/(?:twitter\.com|x\.com|linkedin\.com\/in)\/(@?)([\w._-]+)/i);
    const username = m?.[2] || url.replace(/^@/, '');
    addCreator.mutate(
      {
        workflowId,
        platform,
        creatorProfileId: username,
        creatorName: username,
        creatorUsername: username,
        creatorProfileUrl: url.startsWith('http') ? url : undefined,
      },
      { onSuccess: () => setInput('') },
    );
  }

  return (
    <Row
      label="Target Creators"
      desc="Add Twitter/LinkedIn profile URLs to target specific creators' posts."
      right={<span className="text-[10px] text-slate-500">Add up to {maxCreators} creator profiles. {maxCreators - creators.length} remaining today.</span>}
    >
      <div className="mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={platform === 'TWITTER' ? 'Paste Twitter profile URL...' : 'Paste LinkedIn profile URL...'}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {creators.map((c) => (
          <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/30">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
              {(c.creatorName || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-700 truncate">{c.creatorName}</div>
              <div className="text-[10px] text-slate-400 truncate">@{c.creatorUsername ?? c.creatorProfileId}</div>
            </div>
            <button onClick={() => delCreator.mutate({ workflowId, creatorId: c.id })} className="text-slate-300 hover:text-red-500">×</button>
          </div>
        ))}
      </div>
    </Row>
  );
}

function Row({ label, desc, icon, right, children }: { label: string; desc?: string; icon?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          {icon}{label}
        </div>
        {desc && <div className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{desc}</div>}
        {right && <div className="mt-1">{right}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
      {icon}{children}
    </div>
  );
}

function PlatformIcon({ platform }: { platform: 'LINKEDIN' | 'TWITTER' }) {
  return (
    <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
      {platform === 'TWITTER' ? (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-emerald-600" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.97 6.817H1.673l7.73-8.834L1.254 2.25h6.831l4.713 6.231zm-1.16 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ) : (
        <span className="text-emerald-700 font-bold text-[10px]">in</span>
      )}
    </div>
  );
}
