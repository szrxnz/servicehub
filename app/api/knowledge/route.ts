import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  HttpError,
  apiRoute,
  optionalText,
  readJson,
  requiredId,
  requiredText,
} from "@/lib/http";

const KNOWLEDGE_COLUMNS = "id, machine_model, error_code, symptom, solution, created_at";

export const GET = apiRoute(async (_req, userEmail) => {
  const { data, error } = await getSupabaseAdmin()
    .from("knowledge_base")
    .select(KNOWLEDGE_COLUMNS)
    .eq("user_id", userEmail) // เห็นเฉพาะความรู้ของบัญชีตัวเอง
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  return NextResponse.json({ items: data });
});

export const POST = apiRoute(async (req, userEmail) => {
  const body = await readJson(req);

  const { error } = await getSupabaseAdmin()
    .from("knowledge_base")
    .insert({
      user_id: userEmail,
      machine_model: requiredText(body, "machine_model", "รุ่นเครื่อง"),
      error_code: optionalText(body, "error_code", "Error Code", 50),
      symptom: requiredText(body, "symptom", "อาการเสีย", 1000),
      solution: requiredText(body, "solution", "วิธีแก้ไข", 5000),
    });
  if (error) throw error;

  return NextResponse.json({ success: true }, { status: 201 });
});

export const DELETE = apiRoute(async (req, userEmail) => {
  const id = requiredId(await readJson(req));

  const { data, error } = await getSupabaseAdmin()
    .from("knowledge_base")
    .delete()
    .eq("id", id)
    .eq("user_id", userEmail)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new HttpError(404, "ไม่พบข้อมูลนี้ (อาจถูกลบไปแล้ว)");

  return NextResponse.json({ success: true });
});
