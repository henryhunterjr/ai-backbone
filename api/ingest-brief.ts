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

  const { summary, action_items, draft_replies, community_pulse, content_ideas, morning_post } = req.body;

  if (!summary || typeof summary !== "string") {
    return res.status(400).json({ error: "summary is required" });
  }

  try {
    const briefDate = new Date().toISOString().split("T")[0];
    const embedding = await generateEmbedding(summary);

    const { data, error } = await supabase
      .from("daily_briefs")
      .upsert(
        {
          brief_date: briefDate,
          summary,
          embedding: JSON.stringify(embedding),
          action_items: action_items ?? null,
          draft_replies: draft_replies ?? null,
          community_pulse: community_pulse ?? null,
          content_ideas: content_ideas ?? null,
          morning_post: morning_post ?? null,
        },
        { onConflict: "brief_date" }
      )
      .select("id")
      .single();

    if (error) throw error;

    return res.status(200).json({ id: data.id, date: briefDate, success: true });
  } catch (err: any) {
    console.error("Ingest-brief error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
}
