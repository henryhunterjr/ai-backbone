import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/supabase.js";
import { validateApiKey } from "../../lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const status = (req.query.status as string) ?? "pending";
  const limit = Math.min(parseInt((req.query.limit as string) ?? "50", 10), 200);

  try {
    const { data, error } = await supabase
      .from("content_queue")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return res.status(200).json({ items: data, count: data.length });
  } catch (err: any) {
    console.error("Queue fetch error:", err);
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
}
