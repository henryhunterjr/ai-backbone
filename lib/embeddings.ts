const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small";

/**
 * Generate a 1536-dimension embedding for the given text via OpenAI.
 * Returns the raw float array, ready to insert into a pgvector column.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text.slice(0, 8000),
      model: MODEL,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI embedding error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.data[0].embedding;
}
