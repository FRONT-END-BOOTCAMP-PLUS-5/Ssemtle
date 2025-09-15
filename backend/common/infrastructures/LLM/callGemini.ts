// lib/gemini/callGemini.ts
export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();

  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
