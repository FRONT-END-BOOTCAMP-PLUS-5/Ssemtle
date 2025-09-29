// lib/gemini/callGemini.ts
export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiBase =
    process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const url = `${apiBase}/${apiVersion}/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}`);
  }

  const text =
    (
      data as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      }
    )?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

// 메타데이터(토큰 사용량)를 함께 반환하는 버전
export async function callGeminiWithMeta(prompt: string): Promise<{
  text: string;
  usage?: {
    promptTokens?: number;
    responseTokens?: number;
    totalTokens?: number;
  };
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiBase =
    process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const url = `${apiBase}/${apiVersion}/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}`);
  }

  const text =
    (
      data as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      }
    )?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const usage = (
    data as {
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    }
  ).usageMetadata
    ? {
        promptTokens: (data as { usageMetadata: { promptTokenCount?: number } })
          .usageMetadata.promptTokenCount,
        responseTokens: (
          data as { usageMetadata: { candidatesTokenCount?: number } }
        ).usageMetadata.candidatesTokenCount,
        totalTokens: (data as { usageMetadata: { totalTokenCount?: number } })
          .usageMetadata.totalTokenCount,
      }
    : undefined;

  return { text, usage };
}
