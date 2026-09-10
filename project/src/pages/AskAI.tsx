import { useState, useRef, useEffect, useCallback } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';
import { streamGrokChat, buildCaseContextFromData } from '@/lib/grok';

type Message = { role: 'user' | 'assistant'; content: string };

function buildSuggestedQuestions(entities: { name: string; type: string }[]): string[] {
  const names = entities.slice(0, 4).map(e => e.name);
  const questions: string[] = [];
  if (names.length >= 2) questions.push(`How is ${names[0]} connected to ${names[1]}?`);
  if (names.length >= 1) questions.push(`What are the strongest connections for ${names[0]}?`);
  questions.push('Summarize this case network and its key findings.');
  questions.push('What are the main risk factors in this case?');
  questions.push('List all entities and their roles in this investigation.');
  return questions.slice(0, 5);
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:var(--accent-muted);padding:1px 4px;border-radius:4px;font-size:11px">$1</code>')
    .replace(/^### (.*$)/gm, '<span style="font-weight:700;font-size:13px;color:var(--accent)">$1</span>')
    .replace(/^## (.*$)/gm, '<span style="font-weight:700;font-size:14px;color:var(--accent)">$1</span>')
    .replace(/^# (.*$)/gm, '<span style="font-weight:700;font-size:15px;color:var(--accent)">$1</span>')
    .replace(/^[-*] (.*$)/gm, '<span>• $1</span>')
    .replace(/^(\d+)\. (.*$)/gm, '<span>$1. $2</span>')
    .replace(/\n/g, '<br/>');
}

export default function AskAI() {
  const { caseData, fir, entities, relationships, risk, analysis, loading } = useCaseData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<boolean>(false);

  const hasApiKey = Boolean(import.meta.env.VITE_XAI_API_KEY);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, responding]);

  const handleAsk = useCallback(async (question: string) => {
    if (!question.trim() || responding) return;

    setError(null);
    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setResponding(true);
    abortRef.current = false;

    const context = buildCaseContextFromData(caseData, fir, entities, relationships, risk, analysis);

    try {
      const allMessages: Message[] = [...messages, userMsg];
      let fullResponse = '';

      const stream = streamGrokChat(allMessages, context);

      for await (const chunk of stream) {
        if (abortRef.current) break;
        fullResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const lastAssistant = updated.filter((m: Message) => m.role === 'assistant').pop();
          if (lastAssistant) {
            lastAssistant.content = fullResponse;
          } else {
            updated.push({ role: 'assistant', content: fullResponse });
          }
          return [...updated];
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while communicating with Grok AI.';
      setError(msg);
    } finally {
      setResponding(false);
    }
  }, [caseData, fir, entities, relationships, risk, analysis, messages, responding]);

  const suggested = buildSuggestedQuestions(entities);

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      ) : (
      <>
        <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Ask AI — Investigator Assistant</h1>
              <p className="text-xs text-gray-500">Powered by Grok AI. Answers are grounded in this case's data only.</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setError(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">refresh</span>
                Clear Chat
              </button>
            )}
          </div>
        </header>

        <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="glass-card p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider">{caseData.title}</h2>
              <span className="text-[10px] text-gray-500 font-mono">{caseData.id}{hasApiKey ? ' · Grok AI' : ' · no API key'}</span>
            </div>

            {!hasApiKey && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
                <p className="text-xs text-yellow-500 font-medium">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">warning</span>
                  VITE_XAI_API_KEY not found. Add your xAI API key to the <code className="font-mono">.env</code> file.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {messages.length === 0 && (
              <div className="space-y-2">
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-400">
                    Ask me about entities, connections, FIR details, risk assessment, or analysis in <strong>{caseData.title}</strong>.
                    I will only answer from the case data.
                  </p>
                </div>
                {suggested.map((q, i) => (
                  <button key={i} onClick={() => handleAsk(q)} className="w-full text-left px-4 py-3 rounded-xl text-xs text-gray-300 hover:bg-white/[0.04] transition-colors border border-white/[0.04] hover:border-white/[0.08]">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.length > 0 && (
              <div ref={scrollRef} className="space-y-3 mb-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                {messages.map((m, i) => (
                  <div key={i} className={`rounded-xl p-3 text-xs leading-relaxed ${m.role === 'user' ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-gray-300 ml-8' : 'bg-white/[0.03] border border-white/[0.06] text-gray-300 mr-8'}`}>
                    {m.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                    ) : (
                      m.content
                    )}
                  </div>
                ))}
                {responding && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs text-gray-400 mr-8 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin"></div>
                    Analyzing the case graph...
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAsk(input)}
                placeholder={hasApiKey ? 'Ask about this network...' : 'Add VITE_XAI_API_KEY to .env to enable'}
                disabled={!hasApiKey}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[var(--accent)]/30 disabled:opacity-40"
              />
              <button
                onClick={() => handleAsk(input)}
                disabled={!input.trim() || responding || !hasApiKey}
                className="px-4 py-2.5 rounded-xl text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-40"
              >
                {responding ? '...' : 'ASK'}
              </button>
            </div>
          </div>
        </div>
      </>
      )}
    </Layout>
  );
}
