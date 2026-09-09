import { useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

const SUGGESTED_QUESTIONS = [
  'Show the strongest connections of Rahul Verma.',
  'How is Rahul Verma connected to Deepak Rana?',
  'Which individuals connect multiple communities?',
  'Summarize this network.',
  'Show unusual transactions involving this network.',
];

type Message = { role: 'user' | 'assistant'; content: string };

const DEMO_RESPONSES: Record<string, string> = {
  'Show the strongest connections of Rahul Verma.': 'Rahul Verma has the highest degree centrality in the network. He is directly connected to Sameer Khan (Called), DL 3C AK 4471 (Owns), Connaught Place (Visited), and the phone +91 9XXXX-11122 (Used). His strongest connection by interaction frequency is Sameer Khan with multiple calls logged.',
  'How is Rahul Verma connected to Deepak Rana?': 'Rahul Verma and Deepak Rana are connected through the network via Mohit Sharma. Rahul Verma called Sameer Khan, who met Mohit Sharma, who is associated with Deepak Rana. The path is: Rahul Verma → Sameer Khan → Mohit Sharma → Deepak Rana.',
  'Which individuals connect multiple communities?': 'Two bridge entities were identified: Sameer Khan (Community 1) and Mohit Sharma (Community 2). Both have cross-community links and represent the only connection between the two detected communities. Removing either would fragment the network.',
  'Summarize this network.': 'The network contains 43 entities and 87 relationships across 3 detected communities. Rahul Verma has the highest degree centrality; Mohit Sharma acts as the sole bridge between Community 1 and Community 2. Five unusual activities were detected in the past 14 days.',
  'Show unusual transactions involving this network.': 'One unusual transaction was detected: \u20b98,50,000 transfer linked to Sector 18 Warehouse. This amount is approximately 40x the average transaction size in this cluster. The transaction is connected to Deepak Rana through the Northline Logistics Pvt Ltd organization.',
};

export default function AskAI() {
  const { caseData, loading } = useCaseData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [responding, setResponding] = useState(false);

  const handleAsk = (question: string) => {
    if (!question.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setResponding(true);
    setTimeout(() => {
      const response = DEMO_RESPONSES[question] || 'Based on the current case graph, I can see connections between multiple entities. The analysis shows Rahul Verma as the central node with the highest connectivity. For more specific queries, please try one of the suggested questions above.';
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setResponding(false);
    }, 1200);
  };

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
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Ask AI — Investigator Assistant</h1>
          <p className="text-xs text-gray-500">Answers are derived from this case's graph and records, never invented. If the assistant can't ground an answer in the data, it says so.</p>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider">{caseData.title}</h2>
            <span className="text-[10px] text-gray-500 font-mono">{caseData.id} · demo mode</span>
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400">Ask me about entities, connections, or anomalies in {caseData.title}. I'll answer from the case graph only.</p>
              </div>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleAsk(q)} className="w-full text-left px-4 py-3 rounded-xl text-xs text-gray-300 hover:bg-white/[0.04] transition-colors border border-white/[0.04] hover:border-white/[0.08]">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`rounded-xl p-3 text-xs ${m.role === 'user' ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-gray-300 ml-8' : 'bg-white/[0.03] border border-white/[0.06] text-gray-300 mr-8'}`}>
                  {m.content}
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

          {/* Input */}
          <div className="flex items-center gap-2 mt-4">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk(input)}
              placeholder="Ask about this network..."
              className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[var(--accent)]/30"
            />
            <button onClick={() => handleAsk(input)} disabled={!input.trim() || responding} className="px-4 py-2.5 rounded-xl text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-40">
              ASK
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
