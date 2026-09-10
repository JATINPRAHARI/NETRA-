import type { Case, FIR, Entity, Relationship, RiskAssessment, AnalysisRun } from '@/lib/types';

const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildCaseContext(
  caseData: Case,
  fir: FIR,
  entities: Entity[],
  relationships: Relationship[],
  risk: RiskAssessment | null,
  analysis: AnalysisRun | null,
): string {
  const entityList = entities.map(e => `- ${e.name} (Type: ${e.type})${Object.keys(e.metadata).length > 0 ? ` | Metadata: ${JSON.stringify(e.metadata)}` : ''}`).join('\n');

  const relationshipList = relationships.map(r => {
    const source = entities.find(e => e.id === r.source_id);
    const target = entities.find(e => e.id === r.target_id);
    return `- ${source?.name ?? r.source_id} → ${target?.name ?? r.target_id} (${r.type}${r.label ? `: ${r.label}` : ''})`;
  }).join('\n');

  const riskSection = risk ? `Risk Score: ${risk.risk_score}/100 (${risk.risk_level})
Risk Factors:
${risk.factors.map(f => `  - ${f.label}: ${f.value} (Impact: +${f.impact})`).join('\n')}
Disclaimer: ${risk.disclaimer}` : 'No risk assessment available.';

  const analysisSection = analysis ? `Summary: ${analysis.summary}
Investigative Leads:
${analysis.investigative_leads.map((l, i) => `  ${i + 1}. ${l}`).join('\n')}
Important Attributes:
${analysis.important_attributes.map(a => `  - ${a.field}: ${a.value} — ${a.reason}`).join('\n')}` : 'No analysis available.';

  return `You are NETRA Investigator Assistant — an AI that ONLY answers questions about the current investigation case. You must NEVER answer questions unrelated to this case. If a user asks about anything outside this case (e.g., general knowledge, other projects, personal questions, coding, etc.), you MUST respond with: "I can only assist with queries related to this investigation case. Please ask about the case entities, FIR details, relationships, risk assessment, or analysis."

You are a law-enforcement investigative intelligence assistant. Answer questions strictly based on the case data below. Be concise, factual, and highlight connections between entities. Use plain language suitable for investigators. Never fabricate information — if the data does not contain an answer, say so.

## Case Information
Case ID: ${caseData.id}
Title: ${caseData.title}
Status: ${caseData.status}
Priority: ${caseData.priority}
Description: ${caseData.description || 'N/A'}
Source: ${caseData.source}

## FIR Details
FIR Number: ${fir.fir_number}
District: ${fir.district_name || 'N/A'}
Police Unit: ${fir.unit_name || 'N/A'}
Crime Group: ${fir.crime_group_name || 'N/A'}
Crime Head: ${fir.crime_head_name || 'N/A'}
Act/Section: ${fir.act_section || 'N/A'}
IO Name: ${fir.io_name || 'N/A'}
Place of Offence: ${fir.place_of_offence || 'N/A'}
Offence Duration: ${fir.offence_duration || 'N/A'}
FIR Type: ${fir.fir_type || 'N/A'}
FIR Stage: ${fir.fir_stage || 'N/A'}
Complaint Mode: ${fir.complaint_mode || 'N/A'}
Victims: ${fir.victim_count} (Male: ${fir.male_victims}, Female: ${fir.female_victims})
Accused: ${fir.accused_count} | Arrested: ${fir.arrested_count}

## Entities (${entities.length} total)
${entityList || 'No entities loaded.'}

## Relationships (${relationships.length} total)
${relationshipList || 'No relationships loaded.'}

## Risk Assessment
${riskSection}

## Analysis
${analysisSection}`;
}

export async function* streamGrokChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  caseContext: string,
): AsyncGenerator<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY is not set. Please add your Groq API key to the .env file.');
  }

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: caseContext },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.3,
      max_tokens: 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    let errBody = '';
    try {
      const errJson = await response.json();
      errBody = errJson?.error?.message || JSON.stringify(errJson);
    } catch {
      errBody = await response.text().catch(() => '');
    }
    if (response.status === 401) throw new Error('Invalid API key. Please check your VITE_GROQ_API_KEY.');
    if (response.status === 429) throw new Error('Rate limited. Please wait a moment and try again.');
    throw new Error(`Grok API error (${response.status}): ${errBody || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export function buildCaseContextFromData(
  caseData: Case,
  fir: FIR,
  entities: Entity[],
  relationships: Relationship[],
  risk: RiskAssessment | null,
  analysis: AnalysisRun | null,
): string {
  return buildCaseContext(caseData, fir, entities, relationships, risk, analysis);
}
