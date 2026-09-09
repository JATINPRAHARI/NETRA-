import { useState, useRef } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

type UploadedDoc = {
  id: string;
  filename: string;
  type: string;
  status: 'Processing' | 'Completed' | 'Error';
  entities: number;
  relationships: number;
  uploadedAt: string;
};

type ExtractedEntity = {
  name: string;
  type: string;
  sourceDoc: string;
  confidence: number;
};

const PIPELINE_STEPS = [
  { label: 'Ingest', icon: 'upload_file' },
  { label: 'Preprocess', icon: 'settings_suggest' },
  { label: 'NLP',  icon: 'psychology' },
  { label: 'Entity extract', icon: 'account_tree' },
  { label: 'Relationship extract', icon: 'schema' },
  { label: 'Entity resolution', icon: 'merge' },
  { label: 'Knowledge graph', icon: 'lan' },
];

const DEMO_EXTRACTED_ENTITIES: ExtractedEntity[] = [
  { name: 'Rahul Verma', type: 'PERSON', sourceDoc: 'CDR_2026_08.csv', confidence: 98 },
  { name: 'Sameer Khan', type: 'PERSON', sourceDoc: 'CDR_2026_08.csv', confidence: 98 },
  { name: 'Mohit Sharma', type: 'PERSON', sourceDoc: 'FIR_Report_17.pdf', confidence: 77 },
  { name: 'Anil Yadav', type: 'PERSON', sourceDoc: 'Vehicle_Registry', confidence: 88 },
  { name: 'Deepak Rana', type: 'PERSON', sourceDoc: 'Surveillance_09.pdf', confidence: 65 },
  { name: 'Karan Malik', type: 'PERSON', sourceDoc: 'Social_Intel_04', confidence: 55 },
  { name: 'S. Khan', type: 'PERSON', sourceDoc: 'Surveillance_11.pdf', confidence: 60 },
  { name: 'DL 3C AK 4471', type: 'VEHICLE', sourceDoc: 'Vehicle_Registry', confidence: 88 },
  { name: 'Delhi Railway Station', type: 'LOCATION', sourceDoc: 'FIR_Report_17.pdf', confidence: 81 },
  { name: 'Sector 18 Warehouse', type: 'LOCATION', sourceDoc: 'Criminal_History_DB', confidence: 84 },
  { name: 'Connaught Place', type: 'LOCATION', sourceDoc: 'Surveillance_09.pdf', confidence: 66 },
  { name: 'Northline Logistics Pvt Ltd', type: 'ORGANIZATION', sourceDoc: 'Criminal_History_DB', confidence: 90 },
  { name: '+91 9XXXX-11122', type: 'PHONE', sourceDoc: 'CDR_2026_08.csv', confidence: 99 },
  { name: '\u20b98,50,000 transfer', type: 'TRANSACTION', sourceDoc: 'Txn_Aug2026.csv', confidence: 93 },
];

export default function Upload() {
  const { caseData, entities, relationships, loading } = useCaseData();
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    const newDocs: UploadedDoc[] = Array.from(files).map(f => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      filename: f.name,
      type: f.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      status: 'Processing',
      entities: 0,
      relationships: 0,
      uploadedAt: new Date().toISOString(),
    }));
    setUploadedDocs(prev => [...newDocs, ...prev]);
    setProcessing(true);
    setPipelineStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setPipelineStep(step);
      if (step >= PIPELINE_STEPS.length - 1) {
        clearInterval(interval);
        setProcessing(false);
        setUploadedDocs(prev => prev.map(d =>
          d.status === 'Processing' ? { ...d, status: 'Completed', entities: Math.floor(Math.random() * 8) + 2, relationships: Math.floor(Math.random() * 6) + 1 } : d
        ));
      }
    }, 800);
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
          <h1 className="text-2xl font-extrabold tracking-tight">Data Upload & Ingestion</h1>
          <p className="text-xs text-gray-500">Accepts FIRs, CDRs, financial transactions, surveillance reports, social intelligence, and criminal history files. Demo mode — uploads are simulated.</p>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Upload Source Data */}
        <div className="glass-card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Upload Source Data</h2>
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5' : 'border-white/[0.08] hover:border-[var(--accent)]/20'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" multiple accept=".csv,.xlsx,.json,.pdf,.txt" onChange={e => handleUpload(e.target.files)} className="hidden" />
            <span className="material-symbols-outlined text-4xl text-gray-500 mb-3 block">cloud_upload</span>
            <p className="text-sm text-gray-300 mb-1">Drag files here, or click to browse</p>
            <p className="text-[10px] text-gray-500">CSV &middot; XLSX &middot; JSON &middot; PDF &middot; TXT — multiple files supported</p>
          </div>
        </div>

        {/* Processing Pipeline */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Processing Pipeline</h2>
            <span className="text-[10px] text-gray-500 font-mono">{entities.length} entities &rarr; {relationships.length} relationships in the graph so far</span>
          </div>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < pipelineStep ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    i === pipelineStep && processing ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 animate-pulse' :
                    'bg-white/[0.04] text-gray-500 border border-white/[0.06]'
                  }`}>
                    {i < pipelineStep ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
                  </div>
                  <span className="text-[9px] text-gray-400 text-center">{step.label}</span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className={`h-[1px] w-6 mt-[-14px] transition-colors duration-300 ${i < pipelineStep ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Documents on File */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Documents on File</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Filename</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Type</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Entities</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Relationships</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {uploadedDocs.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">No documents uploaded yet this session.</td></tr>
                ) : uploadedDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-gray-300">{doc.filename}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{doc.type}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        doc.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        doc.status === 'Processing' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{doc.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{doc.entities || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{doc.relationships || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extracted Entities */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Extracted Entities</h2>
            <span className="text-[10px] text-gray-500">from this case's processed documents</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Entity</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Type</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Source Document</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Extraction Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {DEMO_EXTRACTED_ENTITIES.map((ent, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="px-5 py-3 text-xs font-medium text-gray-300">{ent.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                        ent.type === 'PERSON' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        ent.type === 'VEHICLE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        ent.type === 'LOCATION' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        ent.type === 'ORGANIZATION' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        ent.type === 'PHONE' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>{ent.type}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{ent.sourceDoc}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-300">{ent.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
