import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const pin = req.headers["x-admin-pin"] as string;
  if (pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET — paginated memory list with optional filters
  if (req.method === "GET") {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const category = req.query.category as string;
    const source = req.query.source as string;
    const search = req.query.search as string;

    try {
      let query = supabase
        .from("memories")
        .select("id, content, category, source, importance, tags, created_at, access_count", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (category) query = query.eq("category", category);
      if (source) query = query.eq("source", source);
      if (search) query = query.ilike("content", `%${search}%`);

      const { data, error, count } = await query;
      if (error) throw error;

      return res.status(200).json({
        memories: data || [],
        total: count || 0,
        page,
        pages: Math.ceil((count || 0) / limit),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE — remove a memory by id
  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id is required" });

    try {
      const { error } = await supabase.from("memories").delete().eq("id", id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
