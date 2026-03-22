import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../lib/supabase.js";
import { generateEmbedding } from "../lib/embeddings.js";
import { validateApiKey } from "../lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ error: "q (query string) is required" });
    }

    const count = Math.min(parseInt(req.query.count as string) || 5, 20);
    const category = (req.query.category as string) || null;

    const queryEmbedding = await generateEmbedding(q);

    const { data, error } = await supabase.rpc("search_memories", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: count,
      filter_category: category,
    });

    if (error) {
      console.error("Search error:", error);
      return res.status(500).json({ error: "Search failed", details: error.message });
    }

    const memories = data || [];

    const contextLines = memories.map(
      (m: { content: string; category: string; source: string; similarity: number }, i: number) =>
        `[${i + 1}] (${m.category || "general"}, ${(m.similarity * 100).toFixed(0)}% match) ${m.content}`
    );

    const context =
      memories.length > 0
        ? `Relevant context from your knowledge base:\n\n${contextLines.join("\n\n")}`
        : "No relevant memories found for this query.";

    return res.status(200).json({ context, memories });
  } catch (err: any) {
    console.error("Retrieve error:", err);
    return res.status(500).json({ error: err.message ?? "Unknown error" });
  }
}
