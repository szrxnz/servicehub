import { redirect } from "next/navigation";

// หน้าแรก "/" ไม่มีเนื้อหาของตัวเอง → ส่งไป /dashboard
// (ถ้ายังไม่ได้ login หน้า dashboard จะพาไป /login ต่อเอง ผ่าน useRequireAuth)
export default function Home() {
  redirect("/dashboard");
}
