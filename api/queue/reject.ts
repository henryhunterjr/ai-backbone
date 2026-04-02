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

  const { id, reviewed_by, reason } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const { data: item, error: fetchError } = await supabase
      .from("content_queue")
      .select("id")
      .eq("id", id)
      .eq("status", "pending")
      .single();

    if (fetchError || !item) {
      return res.status(404).json({ error: "Pending item not found" });
    }

    const { error: updateError } = await supabase
      .from("content_queue")
      .update({
        status: "rejected",
        reviewed_by: reviewed_by ?? null,
        reviewed_at: new Date().toISOString(),
        metadata: reason ? { rejection_reason: reason } : undefined,
      })
      .eq("id", id);

    if (updateError) throw updateError;

    return res.status(200).json({ id, status: "rejected", success: true });
  } catch (err: any) {
    console.error("Queue reject error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
}
