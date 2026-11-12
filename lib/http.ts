import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type JsonBody = Record<string, unknown>;

/** ห่อ route handler: ตรวจ login ก่อน และจัดการ error ให้เป็น JSON เสมอ */
export function apiRoute(
  handler: (req: Request, userEmail: string) => Promise<Response>,
) {
  return async (req: Request): Promise<Response> => {
    try {
      const session = await getServerSession(authOptions);
      const email = session?.user?.email;
      if (!email) throw new HttpError(401, "กรุณาเข้าสู่ระบบ");
      return await handler(req, email);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      // ไม่ส่งรายละเอียดภายในกลับไปให้ client
      console.error(error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<JsonBody> {
  try {
    const body: unknown = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as JsonBody;
    }
  } catch {
    // ตกไปที่ error ด้านล่าง
  }
  throw new HttpError(400, "รูปแบบข้อมูลไม่ถูกต้อง");
}

export function optionalText(
  body: JsonBody,
  key: string,
  label: string,
  max = 200,
): string | null {
  const raw = body[key];
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "string") throw new HttpError(400, `${label} ไม่ถูกต้อง`);

  const value = raw.trim();
  if (value.length > max) {
    throw new HttpError(400, `${label} ยาวเกินไป (สูงสุด ${max} ตัวอักษร)`);
  }
  return value || null;
}

export function requiredText(
  body: JsonBody,
  key: string,
  label: string,
  max = 200,
): string {
  const value = optionalText(body, key, label, max);
  if (!value) throw new HttpError(400, `กรุณากรอก${label}`);
  return value;
}

export function oneOf<T extends string>(
  body: JsonBody,
  key: string,
  allowed: readonly T[],
  label: string,
  fallback?: T,
): T {
  const raw = body[key];
  if (raw === undefined && fallback !== undefined) return fallback;
  if (typeof raw === "string" && (allowed as readonly string[]).includes(raw)) {
    return raw as T;
  }
  throw new HttpError(400, `${label} ไม่ถูกต้อง`);
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requiredId(body: JsonBody): string {
  const id = body.id;
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
    throw new HttpError(400, "รหัสรายการไม่ถูกต้อง");
  }
  return id;
}
