import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const pin = req.headers["x-admin-pin"] as string;
  if (pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET — list all authorized users
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("authorized_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json({ users: data || [] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — add a new authorized user
  if (req.method === "POST") {
    const { email, name, notes } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    try {
      const { data, error } = await supabase
        .from("authorized_users")
        .upsert({ email: email.toLowerCase().trim(), name: name || null, notes: notes || null }, { onConflict: "email" })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ user: data, success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE — remove an authorized user
  if (req.method === "DELETE") {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    try {
      const { error } = await supabase
        .from("authorized_users")
        .delete()
        .eq("email", email.toLowerCase().trim());

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
