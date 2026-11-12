type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

/** เรียก API ภายในแอป — โยน Error พร้อมข้อความภาษาไทยเมื่อไม่สำเร็จ */
export async function apiRequest<T = void>(
  url: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `เกิดข้อผิดพลาด (${res.status})`);
  return data as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}
