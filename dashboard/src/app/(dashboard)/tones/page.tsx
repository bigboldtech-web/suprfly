'use client';

import { useEffect, useState } from 'react';
import { useTones, useTone, useCreateTone, useUpdateTone, useDeleteTone } from '@/hooks/useTones';
import { Trash2, Plus, Sparkles, Save, MessageSquare, Edit3 } from 'lucide-react';
import type { InteractionStyle, WritingStyle, Tone } from '@/types';

const INTERACTION_STYLES: { value: InteractionStyle; label: string; desc: string }[] = [
  { value: 'BOLD_CHALLENGING', label: 'Bold & Challenging', desc: 'Push back respectfully, question assumptions' },
  { value: 'FRIENDLY', label: 'Friendly', desc: 'Warm and encouraging' },
  { value: 'CURIOUS', label: 'Curious', desc: 'Ask thoughtful questions that invite further discussion' },
  { value: 'PROFESSIONAL', label: 'Professional', desc: 'Polished and respectful' },
  { value: 'SUPPORTIVE', label: 'Supportive', desc: 'Affirm and amplify the original point' },
  { value: 'CONTRARIAN', label: 'Contrarian', desc: 'Offer a different angle or perspective' },
];

const WRITING_STYLES: { value: WritingStyle; label: string; desc: string }[] = [
  { value: 'SHARP_FLOWING', label: 'Sharp & Flowing', desc: 'Reads easily, clear rhythm, vivid over elegant. Concrete over smooth.' },
  { value: 'CONVERSATIONAL', label: 'Conversational', desc: 'Casual and natural, like talking to a colleague' },
  { value: 'POLISHED', label: 'Polished', desc: 'Refined and formal' },
  { value: 'PUNCHY', label: 'Punchy', desc: 'Short, direct sentences' },
  { value: 'STORY_DRIVEN', label: 'Story-driven', desc: 'Brief anecdotes' },
  { value: 'ANALYTICAL', label: 'Analytical', desc: 'Data and reasoning forward' },
];

export default function TonesPage() {
  const { data: tones = [] } = useTones();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  useEffect(() => {
    if (!selectedId && tones[0]) setSelectedId(tones[0].id);
  }, [tones, selectedId]);

  const { data: tone } = useTone(selectedId);
  const createTone = useCreateTone();
  const updateTone = useUpdateTone();
  const deleteTone = useDeleteTone();

  const [form, setForm] = useState<{ name: string; interactionStyle: InteractionStyle; writingStyle: WritingStyle; customPrompt: string }>({
    name: '',
    interactionStyle: 'FRIENDLY',
    writingStyle: 'CONVERSATIONAL',
    customPrompt: '',
  });

  useEffect(() => {
    if (tone) {
      setForm({
        name: tone.name,
        interactionStyle: tone.interactionStyle,
        writingStyle: tone.writingStyle,
        customPrompt: tone.customPrompt || '',
      });
    }
  }, [tone]);

  function handleSave() {
    if (!selectedId) return;
    updateTone.mutate({ id: selectedId, ...form });
  }

  function handleCreate() {
    const name = prompt('Tone name?');
    if (!name) return;
    createTone.mutate(
      { name, interactionStyle: 'FRIENDLY', writingStyle: 'CONVERSATIONAL' },
      { onSuccess: (resp) => setSelectedId(resp.data.id) },
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 self-start">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900">List of Tones</h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{tones.length}</span>
          </div>
          <div className="text-xs text-slate-500 mb-4">Create and set up your tone</div>

          <div className="space-y-2">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${selectedId === t.id ? 'bg-blue-50 border border-blue-100' : 'border border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-bold">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{t.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete tone "${t.name}"?`)) deleteTone.mutate(t.id);
                  }}
                  className="p-1 text-red-400 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            ))}
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add a new Tone
          </button>

          <button
            onClick={() => setShowCustomPrompt(true)}
            className="mt-3 w-full text-xs text-blue-500 hover:underline"
          >
            Click here to create your custom prompt
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          {!tone ? (
            <div className="text-center text-sm text-slate-400 py-12">Select or create a tone</div>
          ) : (
            <div className="space-y-5">
              <Field label="Tone Name" icon={<Edit3 className="w-3.5 h-3.5 text-slate-400" />}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-400"
                />
              </Field>

              <Field label="Interaction Style" icon={<MessageSquare className="w-3.5 h-3.5 text-slate-400" />}>
                <select
                  value={form.interactionStyle}
                  onChange={(e) => setForm({ ...form, interactionStyle: e.target.value as InteractionStyle })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
                >
                  {INTERACTION_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                  ))}
                </select>
              </Field>

              <Field label="Writing Style" icon={<Edit3 className="w-3.5 h-3.5 text-slate-400" />}>
                <select
                  value={form.writingStyle}
                  onChange={(e) => setForm({ ...form, writingStyle: e.target.value as WritingStyle })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400"
                >
                  {WRITING_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                  ))}
                </select>
              </Field>

              {showCustomPrompt && (
                <Field label="Custom Prompt (overrides preset styles when filled)">
                  <textarea
                    value={form.customPrompt}
                    onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
                    rows={6}
                    placeholder="Describe exactly how you want comments to be written…"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-400 font-mono"
                  />
                </Field>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={updateTone.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Tone
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
        {icon}
        {label}
      </div>
      {children}
    </label>
  );
}
