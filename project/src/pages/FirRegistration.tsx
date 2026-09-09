import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useCaseData } from '@/lib/useCaseData';
import { addAuditLog } from '@/lib/data';
import Layout from '@/components/Layout';
import type { FIR } from '@/lib/types';

type FirForm = Omit<FIR, 'id' | 'created_at'>;

const initialForm: FirForm = {
  fir_number: '',
  district_name: '',
  unit_name: '',
  fir_year: new Date().getFullYear(),
  fir_month: new Date().getMonth() + 1,
  fir_day: new Date().getDate(),
  offence_duration: '',
  fir_type: 'Cognizable',
  fir_stage: 'Registered',
  complaint_mode: 'In Person',
  crime_group_name: '',
  crime_head_name: '',
  latitude: null,
  longitude: null,
  act_section: '',
  io_name: '',
  kgid: '',
  internal_io: '',
  place_of_offence: '',
  distance_from_ps: '',
  beat_name: '',
  village_area_name: '',
  male_victims: 0,
  female_victims: 0,
  boy_victims: 0,
  girl_victims: 0,
  age_0_victims: 0,
  victim_count: 0,
  accused_count: 0,
  arrested_male: 0,
  arrested_female: 0,
  arrested_count: 0,
  accused_chargesheeted: 0,
  conviction_count: 0,
  unit_id: '',
};

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">{icon}</span>
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
      <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', required = false }: {
  value: string | number | null;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    />
  );
}

function NumberInput({ value, onChange, min = 0 }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Math.max(min, parseInt(e.target.value) || 0))}
      min={min}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function FirRegistration() {
  const { user } = useAuth();
  const { caseData, loading } = useCaseData();
  const navigate = useNavigate();
  const [form, setForm] = useState<FirForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FirForm>(key: K, value: FirForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateVictimTotal = (partial: Partial<FirForm>) => {
    setForm(prev => {
      const next = { ...prev, ...partial };
      next.victim_count = next.male_victims + next.female_victims + next.boy_victims + next.girl_victims + next.age_0_victims;
      return next;
    });
  };

  const updateArrestTotal = (partial: Partial<FirForm>) => {
    setForm(prev => {
      const next = { ...prev, ...partial };
      next.arrested_count = next.arrested_male + next.arrested_female;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fir_number.trim()) return;
    setSubmitting(true);

    try {
      const firRecord: FIR = {
        ...form,
        id: `fir-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      await addAuditLog({
        action: 'FIR_REGISTERED',
        user_id: user?.id ?? null,
        user_name: user?.name ?? 'Unknown',
        case_id: caseData.id,
        resource_type: 'fir',
        resource_id: firRecord.id,
        details: {
          fir_number: firRecord.fir_number,
          crime: firRecord.crime_group_name,
          district: firRecord.district_name,
        },
      });

      setSubmitted(true);
    } catch {
      console.error('FIR registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout caseId={caseData.id}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
            </div>
            <h2 className="text-xl font-bold mb-2">FIR Registered Successfully</h2>
            <p className="text-sm text-gray-400 mb-1">FIR Number: <span className="font-mono text-[var(--accent)]">{form.fir_number}</span></p>
            <p className="text-xs text-gray-500 mb-6">The FIR has been recorded and added to the audit trail.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setForm(initialForm); setSubmitted(false); }}
                className="px-5 py-2.5 glass-card hover:bg-white/[0.06] rounded-xl text-sm font-medium transition-all"
              >
                Register Another
              </button>
              <button
                onClick={() => navigate(`/cases/${caseData.id}/fir`)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--accent)', color: '#0a0f18' }}
              >
                View FIR Details
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Register FIR</h1>
          <p className="text-xs text-gray-500">File a new First Information Report</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 animate-fade-in max-w-4xl">
        {/* FIR Basic Info */}
        <Section title="FIR Information" icon="description">
          <Field label="FIR Number *">
            <Input value={form.fir_number} onChange={v => update('fir_number', v)} placeholder="e.g. fir-2024-bangalore-001" required />
          </Field>
          <Field label="FIR Type">
            <Select value={form.fir_type ?? ''} onChange={v => update('fir_type', v)} options={['Cognizable', 'Non-Cognizable']} />
          </Field>
          <Field label="FIR Stage">
            <Select value={form.fir_stage ?? ''} onChange={v => update('fir_stage', v)} options={['Registered', 'Under Investigation', 'Chargesheeted', 'Closed']} />
          </Field>
          <Field label="Complaint Mode">
            <Select value={form.complaint_mode ?? ''} onChange={v => update('complaint_mode', v)} options={['In Person', 'Phone', 'Online', 'Written', 'Anonymous']} />
          </Field>
          <Field label="Offence Duration">
            <Input value={form.offence_duration} onChange={v => update('offence_duration', v)} placeholder="e.g. Between 14:00 and 16:00 hours" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Date of Offence</label>
            <div className="sm:col-span-2 grid grid-cols-3 gap-2">
              <NumberInput value={form.fir_day ?? 1} onChange={v => update('fir_day', v)} min={1} />
              <NumberInput value={form.fir_month ?? 1} onChange={v => update('fir_month', v)} min={1} />
              <NumberInput value={form.fir_year ?? new Date().getFullYear()} onChange={v => update('fir_year', v)} min={2000} />
            </div>
          </div>
        </Section>

        {/* Crime Info */}
        <Section title="Crime Information" icon="gavel">
          <Field label="Crime Group *">
            <Input value={form.crime_group_name} onChange={v => update('crime_group_name', v)} placeholder="e.g. Theft" required />
          </Field>
          <Field label="Crime Head">
            <Input value={form.crime_head_name} onChange={v => update('crime_head_name', v)} placeholder="e.g. Theft - Motor Vehicle" />
          </Field>
          <Field label="Act / Section">
            <Input value={form.act_section} onChange={v => update('act_section', v)} placeholder="e.g. Section 379 IPC" />
          </Field>
        </Section>

        {/* Location */}
        <Section title="Location" icon="location_on">
          <Field label="District">
            <Input value={form.district_name} onChange={v => update('district_name', v)} placeholder="e.g. BANGALORE URBAN" />
          </Field>
          <Field label="Place of Offence">
            <Input value={form.place_of_offence} onChange={v => update('place_of_offence', v)} placeholder="Full address of offence location" />
          </Field>
          <Field label="Village / Area">
            <Input value={form.village_area_name} onChange={v => update('village_area_name', v)} placeholder="e.g. Siddapura Village" />
          </Field>
          <Field label="Beat">
            <Input value={form.beat_name} onChange={v => update('beat_name', v)} placeholder="e.g. Beat 12 - Jayamahal" />
          </Field>
          <Field label="Distance from PS">
            <Input value={form.distance_from_ps} onChange={v => update('distance_from_ps', v)} placeholder="e.g. 2.5 km" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Coordinates</label>
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                value={form.latitude ?? ''}
                onChange={e => update('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Latitude"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <input
                type="number"
                step="any"
                value={form.longitude ?? ''}
                onChange={e => update('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Longitude"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Section>

        {/* Police Unit */}
        <Section title="Police Unit & Investigating Officer" icon="local_police">
          <Field label="Police Unit">
            <Input value={form.unit_name} onChange={v => update('unit_name', v)} placeholder="e.g. Jayamahal Police Station" />
          </Field>
          <Field label="Unit ID">
            <Input value={form.unit_id} onChange={v => update('unit_id', v)} placeholder="e.g. UNIT-BNG-JM-012" />
          </Field>
          <Field label="Investigating Officer">
            <Input value={form.io_name} onChange={v => update('io_name', v)} placeholder="e.g. Inspector Rajesh Kumar" />
          </Field>
          <Field label="KGID">
            <Input value={form.kgid} onChange={v => update('kgid', v)} placeholder="e.g. KGID-10234" />
          </Field>
          <Field label="Internal IO">
            <Input value={form.internal_io} onChange={v => update('internal_io', v)} placeholder="e.g. IO-BNG-0847" />
          </Field>
        </Section>

        {/* Victims */}
        <Section title="Victim Information" icon="person">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Male Victims</label>
              <NumberInput value={form.male_victims} onChange={v => updateVictimTotal({ male_victims: v })} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Female Victims</label>
              <NumberInput value={form.female_victims} onChange={v => updateVictimTotal({ female_victims: v })} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Boy Victims</label>
              <NumberInput value={form.boy_victims} onChange={v => updateVictimTotal({ boy_victims: v })} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Girl Victims</label>
              <NumberInput value={form.girl_victims} onChange={v => updateVictimTotal({ girl_victims: v })} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Infant (Age 0)</label>
              <NumberInput value={form.age_0_victims} onChange={v => updateVictimTotal({ age_0_victims: v })} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--accent)' }}>Total Victims</label>
              <div className="border rounded-lg px-3 py-2 text-sm font-bold" style={{ background: 'var(--accent-muted)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
                {form.victim_count}
              </div>
            </div>
          </div>
        </Section>

        {/* Accused */}
        <Section title="Accused Information" icon="group">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Total Accused</label>
              <NumberInput value={form.accused_count} onChange={v => update('accused_count', v)} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Arrested Male</label>
              <NumberInput value={form.arrested_male} onChange={v => updateArrestTotal({ arrested_male: v })} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Arrested Female</label>
              <NumberInput value={form.arrested_female} onChange={v => updateArrestTotal({ arrested_female: v })} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--accent)' }}>Total Arrested</label>
              <div className="border rounded-lg px-3 py-2 text-sm font-bold" style={{ background: 'var(--accent-muted)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
                {form.arrested_count}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Chargesheeted</label>
              <NumberInput value={form.accused_chargesheeted} onChange={v => update('accused_chargesheeted', v)} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Convictions</label>
              <NumberInput value={form.conviction_count} onChange={v => update('conviction_count', v)} />
            </div>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 glass-card hover:bg-white/[0.06] rounded-xl text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !form.fir_number.trim() || !form.crime_group_name?.trim()}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: '#0a0f18' }}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#0a0f18]/30 border-t-[#0a0f18] rounded-full animate-spin"></div>
                Registering...
              </span>
            ) : 'Register FIR'}
          </button>
        </div>
      </form>
      </>
      )}
    </Layout>
  );
}
