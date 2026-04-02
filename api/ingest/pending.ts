import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/supabase.js";
import { validateApiKey } from "../../lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    title,
    url,
    content_type,
    source_platform,
    topic_slugs,
    date_published,
    performance_tier,
    submitted_by,
    metadata,
  } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url is required" });
  }
  if (!content_type || typeof content_type !== "string") {
    return res.status(400).json({ error: "content_type is required" });
  }

  try {
    const { data, error } = await supabase
      .from("content_queue")
      .insert({
        title,
        url,
        content_type,
        source_platform: source_platform ?? null,
        topic_slugs: topic_slugs ?? [],
        date_published: date_published ?? null,
        performance_tier: performance_tier ?? "new",
        status: "pending",
        submitted_by: submitted_by ?? null,
        metadata: metadata ?? {},
      })
      .select("id, status, created_at")
      .single();

    if (error) throw error;

    return res.status(200).json({ id: data.id, status: data.status, success: true });
  } catch (err: any) {
    console.error("Ingest pending error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
}
