import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../lib/supabase.js";
import { generateEmbedding } from "../lib/embeddings.js";
import { validateApiKey } from "../lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { content, category, source, importance, tags, related_ids } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "content is required and must be a string" });
  }

  try {
    const embedding = await generateEmbedding(content);

    const { data, error } = await supabase
      .from("memories")
      .insert({
        content,
        embedding: JSON.stringify(embedding),
        category: category ?? null,
        source: source ?? null,
        importance: importance ?? 3,
        tags: tags ?? null,
        related_ids: related_ids ?? null,
      })
      .select("id")
      .single();

    if (error) throw error;

    return res.status(200).json({ id: data.id, success: true });
  } catch (err: any) {
    console.error("Ingest error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
}
