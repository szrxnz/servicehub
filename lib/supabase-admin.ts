import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Supabase client สิทธิ์ service role (ข้าม RLS)
 * ใช้ได้เฉพาะในโค้ดฝั่งเซิร์ฟเวอร์ (API routes) เท่านั้น — ห้าม import จาก client component
 * สร้างแบบ lazy เพื่อไม่ให้ `next build` พังเมื่อยังไม่ได้ตั้งค่า env
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
