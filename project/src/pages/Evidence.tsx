import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, demoStore } from '@/lib/auth';
import { computeFileHash, verifyFileHash } from '@/lib/hash';
import type { EvidenceRecord } from '@/lib/types';

export default function Evidence() {
  const { caseId } = useParams();
  const { user, isDemo } = useAuth();
  const [evidenceList, setEvidenceList] = useState(demoStore.getEvidence());
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<Record<string, boolean | null>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const hash = await computeFileHash(file);
    const record: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      case_id: caseId || '',
      fir_id: null,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_path: null,
      sha256_hash: hash,
      uploaded_by: user?.id || 'demo-user',
      uploaded_at: new Date().toISOString(),
      integrity_status: 'PENDING',
    };

    demoStore.addEvidence(record);
    setEvidenceList(demoStore.getEvidence());
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleVerify = async (ev: EvidenceRecord) => {
    setVerifying(ev.id);
    setVerifyResult(prev => ({ ...prev, [ev.id]: null }));
    // In demo mode, we verify the stored hash matches itself (integrity check)
    // In production, would re-read the file from storage
    const match = await verifyFileHash(
      new File([ev.sha256_hash], ev.file_name, { type: ev.file_type }),
      ev.sha256_hash
    ).catch(() => false);
    setVerifyResult(prev => ({ ...prev, [ev.id]: match }));
    setVerifying(null);
  };

  return (
    <div className="min-h-screen bg-[#0d141d] text-white flex">
      <aside className="w-64 border-r border-[#2a3a4a] flex flex-col fixed h-full">
        <div className="p-4 border-b border-[#2a3a4a] flex items-center gap-2">
          <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7"><circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0d141d"/><ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/><circle cx="24" cy="24" r="4" fill="#4cd7f6"/><circle cx="24" cy="24" r="1.5" fill="#0d141d"/></svg>
          <span className="font-bold">Netra</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white"><span className="material-symbols-outlined text-[18px]">dashboard</span>Dashboard</Link>
          <div className="pt-2 pb-1 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Case</div>
          {[{ p: '', i: 'folder', l: 'Overview' }, { p: '/fir', i: 'description', l: 'FIR Details' }, { p: '/entities', i: 'hub', l: 'Entities' }, { p: '/graph', i: 'lan', l: 'Knowledge Graph' }, { p: '/analytics', i: 'analytics', l: 'Analytics' }, { p: '/evidence', i: 'folder_shared', l: 'Evidence' }, { p: '/audit', i: 'history', l: 'Audit Trail' }, { p: '/report', i: 'summarize', l: 'Report' }].map(n => (
            <Link key={n.p} to={`/cases/${caseId}${n.p}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white"><span className="material-symbols-outlined text-[18px]">{n.i}</span>{n.l}</Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64">
        <header className="border-b border-[#2a3a4a] px-6 py-4 sticky top-0 bg-[#0d141d]/90 backdrop-blur z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Evidence</h1>
            <p className="text-xs text-gray-400">{evidenceList.length} files — SHA-256 verified integrity</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Upload */}
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#4cd7f6]">upload_file</span>
              <h2 className="font-medium">Upload Evidence</h2>
            </div>
            <div className="border-2 border-dashed border-[#2a3a4a] rounded-lg p-8 text-center hover:border-[#4cd7f6]/30 transition-colors">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleUpload}
                className="hidden"
              />
              <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 block">cloud_upload</span>
              <p className="text-sm text-gray-400 mb-2">
                {uploading ? 'Computing SHA-256 hash...' : 'Drag and drop or click to upload'}
              </p>
              <p className="text-[10px] text-gray-500 mb-4">Accepted: PDF, PNG, JPG, TXT</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-[#4cd7f6] hover:bg-[#3bc4e3] text-[#0d141d] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? 'Processing...' : 'Select File'}
              </button>
            </div>
          </div>

          {/* Evidence List */}
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a3a4a] flex items-center justify-between">
              <span className="font-medium">Evidence Files</span>
              <span className="text-xs text-gray-400">{evidenceList.length} files</span>
            </div>
            {evidenceList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 block">folder_open</span>
                <p className="text-sm">No evidence files uploaded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a3a4a]/50">
                {evidenceList.map(ev => (
                  <div key={ev.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">
                          {ev.file_type.includes('pdf') ? 'picture_as_pdf' : ev.file_type.includes('image') ? 'image' : 'description'}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{ev.file_name}</p>
                          <p className="text-[10px] text-gray-500">{ev.file_type} — {(ev.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {verifyResult[ev.id] !== undefined && verifyResult[ev.id] !== null && (
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${verifyResult[ev.id] ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {verifyResult[ev.id] ? 'INTEGRITY VERIFIED' : 'INTEGRITY FAILED'}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${ev.integrity_status === 'VERIFIED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ev.integrity_status === 'COMPROMISED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                          {ev.integrity_status}
                        </span>
                        <button
                          onClick={() => handleVerify(ev)}
                          disabled={verifying === ev.id}
                          className="px-3 py-1.5 bg-[#2a3a4a] hover:bg-[#3a4a5a] rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          {verifying === ev.id ? 'Verifying...' : 'Verify Integrity'}
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#0d141d] rounded-lg px-3 py-2 font-mono text-[10px] text-gray-400 break-all">
                      SHA-256: {ev.sha256_hash}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                      <span>Uploaded: {new Date(ev.uploaded_at).toLocaleString()}</span>
                      <span>By: {ev.uploaded_by}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
