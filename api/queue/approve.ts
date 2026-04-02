import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/supabase.js";
import { generateEmbedding } from "../../lib/embeddings.js";
import { validateApiKey } from "../../lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id, reviewed_by } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    // Fetch the pending item
    const { data: item, error: fetchError } = await supabase
      .from("content_queue")
      .select("*")
      .eq("id", id)
      .eq("status", "pending")
      .single();

    if (fetchError || !item) {
      return res.status(404).json({ error: "Pending item not found" });
    }

    // Move to approved
    const { error: updateError } = await supabase
      .from("content_queue")
      .update({
        status: "approved",
        reviewed_by: reviewed_by ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // Also ingest into the live memories table for semantic search
    const contentText = `${item.content_type}: ${item.title} at ${item.url}. Topics: ${(item.topic_slugs ?? []).join(", ")}`;
    const embedding = await generateEmbedding(contentText);

    const { error: ingestError } = await supabase
      .from("memories")
      .insert({
        content: contentText,
        embedding: JSON.stringify(embedding),
        category: "content",
        source: item.source_platform ?? "content-queue",
        importance: 3,
        tags: ["bread-authority", "approved", ...(item.topic_slugs ?? [])],
      });

    if (ingestError) {
      console.error("Memory ingest warning:", ingestError);
      // Don't fail the approval if memory ingest fails
    }

    return res.status(200).json({ id, status: "approved", success: true });
  } catch (err: any) {
    console.error("Queue approve error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
}
