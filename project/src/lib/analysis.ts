import type { FIR, AnalysisRun } from './types';

export function analyzeFIR(fir: FIR): Omit<AnalysisRun, 'id' | 'created_at'> {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const monthName = fir.fir_month ? monthNames[fir.fir_month - 1] : 'Unknown';
  const dateStr = `${fir.fir_day || '?'} ${monthName} ${fir.fir_year || '?'}`;

  const summary = `This FIR concerns ${fir.crime_group_name || 'an offence'} (${fir.crime_head_name || 'N/A'}) reported at ${fir.place_of_offence || fir.unit_name || 'the reported location'}, ${fir.district_name || 'Karnataka'} on ${dateStr}. The case was registered under ${fir.act_section || 'applicable sections'} and is currently at the ${fir.fir_stage || 'registered'} stage. ${fir.victim_count} victim(s) and ${fir.accused_count} accused person(s) have been identified. ${fir.arrested_count} arrest(s) have been made.`;

  const investigative_leads: string[] = [];

  if (fir.crime_group_name) {
    investigative_leads.push(`Investigate ${fir.crime_group_name.toLowerCase()} patterns in ${fir.district_name || 'the district'} area`);
  }
  if (fir.accused_count > fir.arrested_count) {
    investigative_leads.push(`Identify and locate ${fir.accused_count - fir.arrested_count} accused person(s) still at large`);
  }
  if (fir.latitude && fir.longitude) {
    investigative_leads.push(`Analyze surveillance footage and witness statements near coordinates ${fir.latitude}, ${fir.longitude}`);
  }
  if (fir.crime_head_name?.toLowerCase().includes('motor vehicle')) {
    investigative_leads.push(`Check RTO records for vehicle registration details`);
    investigative_leads.push(`Review nearby CCTV footage for vehicle movement`);
  }
  if (fir.beat_name) {
    investigative_leads.push(`Coordinate with ${fir.beat_name} personnel for local intelligence`);
  }
  if (fir.distance_from_ps) {
    investigative_leads.push(`Verify response time: offence was ${fir.distance_from_ps} from police station`);
  }
  investigative_leads.push(`Canvass area for witnesses near ${fir.place_of_offence || 'the offence location'}`);

  const important_attributes: { field: string; value: string; reason: string }[] = [];

  if (fir.crime_group_name) {
    important_attributes.push({ field: 'Crime Category', value: fir.crime_group_name, reason: 'Defines investigation approach and applicable procedures' });
  }
  if (fir.crime_head_name) {
    important_attributes.push({ field: 'Crime Sub-category', value: fir.crime_head_name, reason: 'Specific crime type requiring specialized investigation' });
  }
  if (fir.district_name) {
    important_attributes.push({ field: 'District', value: fir.district_name, reason: 'Jurisdiction and resource allocation' });
  }
  if (fir.io_name) {
    important_attributes.push({ field: 'Investigating Officer', value: fir.io_name, reason: 'Primary investigator for case coordination' });
  }
  if (fir.act_section) {
    important_attributes.push({ field: 'Legal Section', value: fir.act_section, reason: 'Applicable law for prosecution' });
  }
  if (fir.victim_count > 0) {
    important_attributes.push({ field: 'Victim Count', value: String(fir.victim_count), reason: 'Impact assessment and witness identification' });
  }
  if (fir.accused_count > 0) {
    important_attributes.push({ field: 'Accused Count', value: String(fir.accused_count), reason: 'Scale of criminal network involvement' });
  }
  if (fir.place_of_offence) {
    important_attributes.push({ field: 'Place of Offence', value: fir.place_of_offence, reason: 'Crime scene investigation and evidence collection' });
  }

  return {
    case_id: '',
    fir_id: null,
    summary,
    investigative_leads,
    important_attributes,
    analysis_type: 'rule_based',
  };
}
