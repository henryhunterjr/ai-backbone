import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const pin = req.headers["x-admin-pin"] as string;
  if (pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Total memories
    const { count: totalMemories } = await supabase
      .from("memories")
      .select("*", { count: "exact", head: true });

    // Memories by category
    const { data: catData } = await supabase
      .from("memories")
      .select("category");
    const byCategory: Record<string, number> = {};
    (catData || []).forEach((m: { category: string }) => {
      const cat = m.category || "uncategorized";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    // Memories by source
    const { data: srcData } = await supabase
      .from("memories")
      .select("source");
    const bySource: Record<string, number> = {};
    (srcData || []).forEach((m: { source: string }) => {
      const src = m.source || "unknown";
      bySource[src] = (bySource[src] || 0) + 1;
    });

    // Recent memories (last 20)
    const { data: recent } = await supabase
      .from("memories")
      .select("id, content, category, source, importance, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    // Member profiles count
    const { count: totalMembers } = await supabase
      .from("member_profiles")
      .select("*", { count: "exact", head: true });

    // Daily briefs count
    const { count: totalBriefs } = await supabase
      .from("daily_briefs")
      .select("*", { count: "exact", head: true });

    // Insights count
    const { count: totalInsights } = await supabase
      .from("insights")
      .select("*", { count: "exact", head: true });

    // Memories per day (last 30 days)
    const { data: dailyData } = await supabase
      .from("memories")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
      .order("created_at", { ascending: true });
    const perDay: Record<string, number> = {};
    (dailyData || []).forEach((m: { created_at: string }) => {
      const day = m.created_at.split("T")[0];
      perDay[day] = (perDay[day] || 0) + 1;
    });

    return res.status(200).json({
      totalMemories: totalMemories || 0,
      totalMembers: totalMembers || 0,
      totalBriefs: totalBriefs || 0,
      totalInsights: totalInsights || 0,
      byCategory,
      bySource,
      perDay,
      recent: recent || [],
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ error: err.message });
  }
}
