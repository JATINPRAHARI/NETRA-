import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useCaseData } from '@/lib/useCaseData';
import { addEvidence as addEvidenceDb, verifyEvidence as verifyEvidenceDb, getEvidence } from '@/lib/data';
import { computeFileHash } from '@/lib/hash';
import type { EvidenceRecord } from '@/lib/types';
import Layout from '@/components/Layout';

export default function Evidence() {
  const { user } = useAuth();
  const { caseData, evidence: initialEvidence, loading } = useCaseData();
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(initialEvidence);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<Record<string, boolean | null>>({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEvidenceList(initialEvidence);
  }, [initialEvidence]);

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const hash = await computeFileHash(file);
      const record: EvidenceRecord = {
        id: `ev-${Date.now()}`,
        case_id: caseData.id,
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

      await addEvidenceDb(record);
      const updated = await getEvidence(caseData.id);
      setEvidenceList(updated);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleVerify = async (ev: EvidenceRecord) => {
    setVerifying(ev.id);
    setVerifyResult(prev => ({ ...prev, [ev.id]: null }));
    try {
      const verified = await verifyEvidenceDb(ev.id);
      setVerifyResult(prev => ({ ...prev, [ev.id]: verified?.integrity_status === 'VERIFIED' }));
      const updated = await getEvidence(caseData.id);
      setEvidenceList(updated);
    } catch (err) {
      console.error('Verification failed:', err);
      setVerifyResult(prev => ({ ...prev, [ev.id]: false }));
    } finally {
      setVerifying(null);
    }
  };

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading evidence...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-extrabold tracking-tight">Evidence</h1>
        <p className="text-xs text-gray-500">{evidenceList.length} files — SHA-256 verified integrity</p>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Upload */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#4cd7f6]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">upload_file</span>
            </div>
            <h2 className="font-medium text-sm">Upload Evidence</h2>
          </div>
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
              dragOver
                ? 'border-[#4cd7f6]/50 bg-[#4cd7f6]/5'
                : 'border-white/[0.08] hover:border-[#4cd7f6]/20 hover:bg-white/[0.01]'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={e => handleUpload(e.target.files)}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-500">cloud_upload</span>
            </div>
            <p className="text-sm text-gray-300 mb-1">
              {uploading ? 'Computing SHA-256 hash...' : 'Drag and drop or click to upload'}
            </p>
            <p className="text-[10px] text-gray-500 mb-4">Accepted: PDF, PNG, JPG, TXT</p>
            {!uploading && (
              <button className="px-5 py-2 bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 text-[#4cd7f6] font-medium text-sm rounded-xl transition-all duration-200 border border-[#4cd7f6]/20">
                Select File
              </button>
            )}
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-[#4cd7f6] text-sm">
                <div className="w-4 h-4 border-2 border-[#4cd7f6]/30 border-t-[#4cd7f6] rounded-full animate-spin"></div>
                Processing...
              </div>
            )}
          </div>
        </div>

        {/* Evidence List */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
            <span className="font-medium text-sm">Evidence Files</span>
            <span className="text-xs text-gray-500">{evidenceList.length} files</span>
          </div>
          {evidenceList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-gray-600">folder_open</span>
              </div>
              <p className="text-sm text-gray-400">No evidence files uploaded yet.</p>
              <p className="text-[10px] text-gray-500 mt-1">Upload files to see them here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {evidenceList.map((ev, i) => (
                <div key={ev.id} className="px-6 py-4 hover:bg-white/[0.01] transition-colors stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#4cd7f6]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">
                          {ev.file_type.includes('pdf') ? 'picture_as_pdf' : ev.file_type.includes('image') ? 'image' : 'description'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{ev.file_name}</p>
                        <p className="text-[10px] text-gray-500">{ev.file_type} — {(ev.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {verifyResult[ev.id] !== undefined && verifyResult[ev.id] !== null && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium ${verifyResult[ev.id] ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {verifyResult[ev.id] ? 'VERIFIED' : 'FAILED'}
                        </span>
                      )}
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium ${ev.integrity_status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ev.integrity_status === 'COMPROMISED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {ev.integrity_status}
                      </span>
                      <button
                        onClick={() => handleVerify(ev)}
                        disabled={verifying === ev.id}
                        className="px-3 py-1.5 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 disabled:opacity-50 flex items-center gap-1 font-medium"
                      >
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        {verifying === ev.id ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl px-3 py-2 font-mono text-[10px] text-gray-500 break-all border border-white/[0.03]">
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
      </>
      )}
    </Layout>
  );
}
