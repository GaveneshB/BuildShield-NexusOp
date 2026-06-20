const router = require('express').Router();

/* ─────────────────────────────────────────────────────────────
   OFFLINE SUGGESTION GENERATOR (FALLBACK RULES)
───────────────────────────────────────────────────────────── */
function getBackendFallbackSuggestion(server) {
  if (server.status === 'ok') return null;

  if (server.cves > 0 || server.firewall === 'inactive') {
    let risks = [];
    let recs = [];
    if (server.cves > 0) {
      risks.push(`${server.cves} unpatched vulnerabilities`);
      recs.push(`apply security hotfixes`);
    }
    if (server.firewall === 'inactive') {
      risks.push(`inactive firewall policy`);
      recs.push(`enable firewall security rules`);
    }

    if (server.cpu < 15) {
      risks.push(`severe CPU idle state (${server.cpu}%)`);
      recs.push(`downsize instance size`);
      return {
        action: `Secure and Downsize ${server.name}`,
        why: `Server is exposed via ${risks.join(' & ')} while wasting power in idle state.`,
        recommendation: `${recs.join(', ')} to restore resource utility and patch threat exposures.`,
        carbonSave: parseFloat((server.powerW * 0.4 * server.gridIntensity / 1000000 * 24).toFixed(2)),
        costSave: parseFloat((server.powerW * 0.4 / 1000 * 24 * 0.15).toFixed(2)),
      };
    } else if (server.gridIntensity > 300) {
      risks.push(`hosted in high carbon intensity grid (${server.region})`);
      recs.push(`migrate host to cleaner regional grid`);
      return {
        action: `Patch & Migrate ${server.name}`,
        why: `Server suffers from ${risks.join(' & ')} under heavy carbon energy supply.`,
        recommendation: `${recs.join(', ')} (e.g. EU-West) to minimize regulatory risk and footprint.`,
        carbonSave: parseFloat((server.powerW * (server.gridIntensity - 185) / 1000000 * 24).toFixed(2)),
        costSave: parseFloat((server.powerW / 1000 * 24 * 0.08).toFixed(2)),
      };
    } else {
      return {
        action: `Patch & Harden ${server.name}`,
        why: `Server is exposed with ${risks.join(' & ')}. Security score degraded.`,
        recommendation: `${recs.join(' and ')} immediately.`,
        carbonSave: 1.20,
        costSave: 0.00,
      };
    }
  }

  if (server.cpu < 15) {
    return {
      action: `Downsize ${server.name}`,
      why: `CPU usage is only ${server.cpu}%. The server is over-provisioned. Full power is drawn even when mostly idle.`,
      recommendation: `Move workload to a smaller instance type or share with another underused server.`,
      carbonSave: parseFloat((server.powerW * 0.4 * server.gridIntensity / 1000000 * 24).toFixed(2)),
      costSave: parseFloat((server.powerW * 0.4 / 1000 * 24 * 0.15).toFixed(2)),
    };
  }
  if (server.cpu > 75 && server.gridIntensity > 300) {
    return {
      action: `Move ${server.name} to cleaner region`,
      why: `Grid intensity is ${server.gridIntensity} gCO₂e/kWh in ${server.region}. This is 3–10× higher than clean-energy regions like EU-West or AP-Hydro.`,
      recommendation: `Migrate workload to a low-carbon region (e.g., EU-West at 185 gCO₂e/kWh or hydro-powered region at ~40 gCO₂e/kWh).`,
      carbonSave: parseFloat((server.powerW * (server.gridIntensity - 185) / 1000000 * 24).toFixed(2)),
      costSave: parseFloat((server.powerW / 1000 * 24 * 0.08).toFixed(2)),
    };
  }
  if (server.type === 'Staging Server' || server.type === 'Dev Environment') {
    return {
      action: `Schedule off-hours shutdown for ${server.name}`,
      why: `Staging and dev servers run 24/7 but are only needed during work hours (~8–10 hrs/day). They waste power at night.`,
      recommendation: `Auto-shutdown from 10 PM to 7 AM daily. This saves ~14 hrs of idle power per day.`,
      carbonSave: parseFloat((server.powerW * 14 * server.gridIntensity / 1000000).toFixed(2)),
      costSave: parseFloat((server.powerW * 14 / 1000 * 0.15).toFixed(2)),
    };
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
   ANALYZE WORKLOAD ENDPOINT
───────────────────────────────────────────────────────────── */
router.post('/analyze', async (req, res) => {
  const { server } = req.body;

  if (!server) {
    return res.status(400).json({ error: 'Missing server telemetry data.' });
  }

  // Read Gemini API Key from backend env
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.log(`No GEMINI_API_KEY found in backend env. Falling back to rule-based suggestion.`);
    const suggestion = getBackendFallbackSuggestion(server);
    return res.json({ suggestion, source: 'fallback' });
  }

  try {
    const modelName = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are BuildShield AI Security and Carbon Auditor.
Analyze the following server telemetry and suggest a combined optimization plan that addresses carbon emissions and security vulnerability mitigations.
You must output ONLY a valid JSON object matching the following structure exactly, with no markdown formatting, no code block backticks (do NOT wrap in \`\`\`json), and no extra text:
{
  "action": "Short action name, e.g., 'Downsize analytics-wkr-1 & patch CVEs'",
  "why": "Detailed, simple description in professional B2 English explaining why this workload is emitting too much carbon and/or has security risks (e.g. grid intensity, CPU idle power, unpatched CVEs, open ports). Keep it under 2 sentences.",
  "recommendation": "Specific step-by-step mitigation recommendation, e.g., 'Migrate database to Stockholm (clean grid) and apply CVE patches.'",
  "carbonSave": 12.34, // estimated carbon saved in kg CO2/day (number)
  "costSave": 2.50 // estimated cost saved in RM/day (number)
}

Input Server Telemetry:
- Name: ${server.name}
- Type: ${server.type}
- Region: ${server.region}
- CPU Usage: ${server.cpu}%
- RAM Usage: ${server.ram}%
- Grid Carbon Intensity: ${server.gridIntensity} gCO2e/kWh
- Power Consumption: ${server.powerW} Watts
- Active CVEs / Vulnerabilities: ${server.cves}
- Firewall Status: ${server.firewall}
- Current Security Grade: ${server.securityGrade}

Remember, do not include any backticks or markdown, just return the raw JSON string.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No response content from Gemini.');
    }

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanedText);
    const suggestion = {
      action: parsed.action || `Optimize ${server.name}`,
      why: parsed.why || `This server runs at low efficiency in a high carbon region.`,
      recommendation: parsed.recommendation || `Patch server vulnerabilities and downsize the server.`,
      carbonSave: typeof parsed.carbonSave === 'number' ? parsed.carbonSave : 5.0,
      costSave: typeof parsed.costSave === 'number' ? parsed.costSave : 1.0,
    };

    return res.json({ suggestion, source: 'gemini' });

  } catch (err) {
    console.error(`Gemini backend API execution failed:`, err.message);
    const suggestion = getBackendFallbackSuggestion(server);
    return res.json({ suggestion, source: 'fallback', error: err.message });
  }
});

module.exports = router;