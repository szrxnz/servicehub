import { NextResponse } from "next/server";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { HttpError, apiRoute, readJson, requiredText } from "@/lib/http";

// เปลี่ยนรุ่นได้ผ่าน env CEREBRAS_MODEL
const MODEL = process.env.CEREBRAS_MODEL || "qwen-3.8-27b";
const MAX_PROMPT_LENGTH = 2000;
const MAX_COMPLETION_TOKENS = 1024;

const SYSTEM_PROMPT = `คุณคือผู้ช่วยช่างซ่อมรถโฟล์คลิฟท์ (Forklift) มืออาชีพ
ธุรกิจนี้คือการซ่อมบำรุงรถโฟล์คลิฟท์ เช่น ระบบไฮดรอลิก เสา ก้ามปู แบตเตอรี่ มอเตอร์ เครื่องยนต์ และ Error Code ของรถ

ช่วยตอบคำถาม สรุปข้อมูลงานซ่อม และวิเคราะห์อาการเสียจากข้อมูลที่ให้ไป

กติกาการตอบ:
- ตอบเป็นภาษาไทยที่เข้าใจง่าย กระชับ และเป็นมืออาชีพ
- สะกดคำว่า "โฟล์คลิฟท์" ให้ถูกต้องเสมอ
- ห้ามใช้สัญลักษณ์ Markdown เช่น ** # หรือ ___ ให้เขียนเป็นข้อความธรรมดา ใช้ขีดนำหน้า (-) หรือเลขข้อได้
- ถ้าข้อมูลในระบบไม่พอ ให้บอกตรง ๆ ว่าไม่ทราบ อย่าเดาหรือแต่งข้อมูลขึ้นเอง
- ตอบเป็นภาษาไทยเท่านั้น (ศัพท์เทคนิคใช้ภาษาอังกฤษได้) ห้ามมีตัวอักษรจีน ญี่ปุ่น หรือเกาหลีเด็ดขาด`;

/** ดึงงานล่าสุดจากฐานข้อมูลฝั่งเซิร์ฟเวอร์ (ไม่เชื่อ context ที่ client ส่งมา) */
async function buildJobsContext(userEmail: string): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .from("jobs")
    .select("customer, machine, error_code, issue, status")
    .eq("user_id", userEmail)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return "ไม่สามารถโหลดข้อมูลงานจากระบบได้";
  }
  if (!data?.length) return "ยังไม่มีข้อมูลงานในระบบ";

  const lines = data.map(
    (job) =>
      `- ลูกค้า: ${job.customer}, รุ่น: ${job.machine}, Error: ${job.error_code || "-"}, อาการ: ${job.issue}, สถานะ: ${job.status}`,
  );
  return `ข้อมูลงานล่าสุด ${data.length} รายการ:\n${lines.join("\n")}`;
}

export const POST = apiRoute(async (req, userEmail) => {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new HttpError(500, "ยังไม่ได้ตั้งค่า CEREBRAS_API_KEY ในเซิร์ฟเวอร์");

  const body = await readJson(req);
  const prompt = requiredText(body, "prompt", "คำถาม", MAX_PROMPT_LENGTH);
  const context = await buildJobsContext(userEmail);

  try {
    const cerebras = new Cerebras({ apiKey });
    const completion = await cerebras.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\nข้อมูลเพิ่มเติมจากระบบ:\n${context}` },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      temperature: 0.2,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
    });

    const text = (completion as { choices: { message: { content?: string | null } }[] })
      .choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Cerebras returned empty content");

    // กันตัวอักษรจีน/ญี่ปุ่น/เกาหลีที่โมเดลบางครั้งปนมา
    const cleaned = text
      .replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g, "")
      .replace(/ {2,}/g, " ");
    return NextResponse.json({ text: cleaned });
  } catch (error) {
    console.error(error);
    throw new HttpError(502, "เรียกใช้ AI ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  }
});
