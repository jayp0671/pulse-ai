function extractText(responseJson) {
  const parts = responseJson?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const text = parts.map((part) => part?.text || '').join('\n').trim();
    if (text) return text;
  }

  const finishReason = responseJson?.candidates?.[0]?.finishReason;
  const blockReason = responseJson?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Gemini blocked the request: ${blockReason}`);
  }

  throw new Error(`Gemini returned no text${finishReason ? ` (finishReason: ${finishReason})` : ''}`);
}

export async function generateBriefing({ apiKey, model, systemInstruction, userPrompt }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2500
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000)
  });

  const responseText = await response.text();
  let responseJson;

  try {
    responseJson = JSON.parse(responseText);
  } catch {
    throw new Error(`Gemini returned non-JSON output: ${responseText.slice(0, 500)}`);
  }

  if (!response.ok) {
    const errorMessage = responseJson?.error?.message || response.statusText || 'Unknown Gemini error';
    throw new Error(`Gemini request failed with ${response.status}: ${errorMessage}`);
  }

  const briefing = extractText(responseJson);

  return {
    requestBody: body,
    responseJson,
    briefing
  };
}
