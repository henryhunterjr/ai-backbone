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

  const { skool_name, name, notes, tags } = req.body;
  const memberName = skool_name || name;

  if (!memberName || typeof memberName !== "string") {
    return res.status(400).json({ error: "skool_name or name is required" });
  }

  try {
    const textForEmbedding = [memberName, notes].filter(Boolean).join(" — ");
    const embedding = await generateEmbedding(textForEmbedding);

    // Check if member already exists
    const { data: existing } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("skool_name", memberName)
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("member_profiles")
        .update({
          notes,
          tags: tags ?? null,
          embedding: JSON.stringify(embedding),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;
      return res.status(200).json({ id: existing.id, updated: true });
    } else {
      const { data, error } = await supabase
        .from("member_profiles")
        .insert({
          skool_name: memberName,
          notes,
          tags: tags ?? null,
          embedding: JSON.stringify(embedding),
        })
        .select("id")
        .single();

      if (error) throw error;
      return res.status(200).json({ id: data.id, created: true });
    }
  } catch (err: any) {
    console.error("Ingest-member error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
}
