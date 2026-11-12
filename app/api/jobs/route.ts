import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  HttpError,
  apiRoute,
  oneOf,
  optionalText,
  readJson,
  requiredId,
  requiredText,
} from "@/lib/http";
import { JOB_STATUSES, JOB_URGENCIES } from "@/lib/types";

// เลือกเฉพาะคอลัมน์ที่หน้าเว็บใช้ (ไม่ส่ง user_id ไปให้ client)
const JOB_COLUMNS =
  "id, customer, machine, error_code, issue, urgency, status, tech, created_at";

export const GET = apiRoute(async (_req, userEmail) => {
  const { data, error } = await getSupabaseAdmin()
    .from("jobs")
    .select(JOB_COLUMNS)
    .eq("user_id", userEmail) // เห็นเฉพาะงานของบัญชีตัวเอง
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  return NextResponse.json({ jobs: data });
});

export const POST = apiRoute(async (req, userEmail) => {
  const body = await readJson(req);

  const { error } = await getSupabaseAdmin()
    .from("jobs")
    .insert({
      user_id: userEmail,
      customer: requiredText(body, "customer", "ชื่อลูกค้า"),
      machine: requiredText(body, "machine", "รุ่นเครื่อง"),
      error_code: optionalText(body, "error_code", "Error Code", 50),
      issue: requiredText(body, "issue", "อาการเสีย", 2000),
      urgency: oneOf(body, "urgency", JOB_URGENCIES, "ความด่วน", "normal"),
      status: "Pending",
      tech: optionalText(body, "tech", "ชื่อช่าง", 100),
    });
  if (error) throw error;

  return NextResponse.json({ success: true }, { status: 201 });
});

export const PUT = apiRoute(async (req, userEmail) => {
  const body = await readJson(req);
  const id = requiredId(body);
  const status = oneOf(body, "status", JOB_STATUSES, "สถานะ");

  const { data, error } = await getSupabaseAdmin()
    .from("jobs")
    .update({ status })
    .eq("id", id)
    .eq("user_id", userEmail)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new HttpError(404, "ไม่พบงานนี้ (อาจถูกลบไปแล้ว)");

  return NextResponse.json({ success: true });
});

export const DELETE = apiRoute(async (req, userEmail) => {
  const id = requiredId(await readJson(req));

  const { data, error } = await getSupabaseAdmin()
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("user_id", userEmail)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new HttpError(404, "ไม่พบงานนี้ (อาจถูกลบไปแล้ว)");

  return NextResponse.json({ success: true });
});
