import type { VercelRequest } from "@vercel/node";

/**
 * Validate the BACKBONE_API_KEY from request headers.
 * Accepts: x-api-key header, Authorization: Bearer <key>, or ?key= query param.
 */
export function validateApiKey(req: VercelRequest): boolean {
  const header =
    req.headers["x-api-key"] ||
    req.headers.authorization?.replace("Bearer ", "") ||
    (req.query.key as string);

  if (!header || typeof header !== "string") return false;
  return header === process.env.BACKBONE_API_KEY;
}
