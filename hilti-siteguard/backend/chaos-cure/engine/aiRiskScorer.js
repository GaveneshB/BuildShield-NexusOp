const { GoogleGenAI } = require('@google/genai');

let aiClient = null;

function getAIClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

/**
 * Uses Gemini to evaluate the incident and select a remediation.
 */
async function evaluateIncident(scenario, policy, stateStore) {
  const ai = getAIClient();

  const prompt = `
You are a top-tier cybersecurity incident response decision engine working for a company using BuildShield.
Your task is to analyze the following real-world security scenario and make a precise, expert-level decision on how to respond.

# Incident Context
- Scenario ID: ${scenario.id}
- Label: ${scenario.label}
- Category: ${scenario.category}
${scenario.cve ? `- CVE ID: ${scenario.cve}` : ''}
${scenario.cvss ? `- CVSS Score: ${scenario.cvss} / 10.0` : ''}
- Description: ${scenario.description}

# Available Remediations
${scenario.remediations.map(r => `- ID: ${r.id} | Label: ${r.label} | Reversible: ${r.reversible} | Destructive: ${r.destructive}`).join('\n')}

# Organization Policy
- Profile: ${policy.label}
- Description: ${policy.description}

# Instructions
You are an expert incident responder. Think through the threat carefully.
1. Calculate a "riskScore" from 0.0 to 1.0 representing how immediately dangerous the incident is (higher = more urgent).
2. Select the BEST remediation from the Available Remediations list by its exact ID.
3. Determine the response tier. It must be one of: "TIER_1_AUTO", "TIER_2_AUTO_NOTIFY", or "TIER_3_APPROVAL_REQUIRED". 
   **CRITICAL SAFETY RULE:** If you choose a remediation where Destructive=true, you MUST output "TIER_3_APPROVAL_REQUIRED" regardless of anything else.
   - TIER_1_AUTO: Safe to execute automatically with no human review.
   - TIER_2_AUTO_NOTIFY: Execute automatically but alert security team.
   - TIER_3_APPROVAL_REQUIRED: Must have human approval before execution.
4. Write a concise but insightful 1-2 sentence reasoning that explains WHY you chose this specific remediation and tier, referencing technical details from the incident.

You MUST respond with a valid JSON object matching this schema exactly. DO NOT wrap in markdown — output raw JSON only.

{
  "riskScore": 0.85,
  "remediationId": "chosen-id-here",
  "tier": "TIER_1_AUTO",
  "reasoning": "Technical reasoning referencing the specific threat here."
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    const result = JSON.parse(resultText);

    return {
      actionScore: result.riskScore,
      urgency: result.riskScore, // Simplify urgency to match riskScore for AI
      confidence: 0.95,
      blastRadius: 0.5,
      reversibility: 0.5,
      aiRemediationId: result.remediationId,
      aiTier: result.tier,
      reasoning: `[AI Decision] ${result.reasoning} → ${result.tier}`,
    };
  } catch (error) {
    console.error('AI Evaluation failed:', error);
    // Fallback if AI fails or key is missing
    return {
      actionScore: 0.5,
      urgency: 0.5,
      confidence: 0.5,
      blastRadius: 0.5,
      reversibility: 0.5,
      aiRemediationId: scenario.remediations[0].id,
      aiTier: 'TIER_3_APPROVAL_REQUIRED',
      reasoning: '[AI Fallback] API error occurred. Defaulting to safe manual approval.',
    };
  }
}

module.exports = {
  evaluateIncident,
};
