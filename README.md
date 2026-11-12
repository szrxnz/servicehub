# Service Hub

ระบบจัดการงานซ่อมบำรุง (Next.js + NextAuth + Supabase + Cerebras)

- **Dashboard** – ดู/ค้นหา/เปลี่ยนสถานะ/ลบใบงาน
- **คลังความรู้** – บันทึกอาการเสียและวิธีแก้ตามรุ่นเครื่อง
- **AI ช่วยงาน** – ถามอาการเสีย / สรุปงานล่าสุด

## เริ่มใช้งาน

1. `npm install`
2. คัดลอก `.env.example` เป็น `.env.local` แล้วกรอกค่า
3. รัน `supabase/supabase.sql` ใน Supabase SQL Editor
4. `npm run dev` แล้วเปิด http://localhost:3000

## หมายเหตุ

- ข้อมูลแยกตามบัญชี: ใบงาน คลังความรู้ และข้อมูลที่ AI เห็น กรองด้วยอีเมลที่ login (`user_id`) ทุกครั้ง แต่ละบัญชีเห็น แก้ และลบได้เฉพาะของตัวเอง
- ข้อมูลทั้งหมดผ่าน API route ฝั่งเซิร์ฟเวอร์ (`app/api/*`) ที่ตรวจ login ก่อนทุกครั้ง
  หน้าเว็บไม่ได้เชื่อมต่อ Supabase โดยตรง จึงไม่ต้องใช้ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` ต้องอยู่ฝั่งเซิร์ฟเวอร์เท่านั้น (ห้ามขึ้นต้นด้วย `NEXT_PUBLIC_`)
- ตั้ง `ALLOWED_EMAILS` เพื่อจำกัดว่าใครเข้าระบบได้ มิฉะนั้นทุกบัญชี Google จะเข้าได้
- ตรวจโค้ด: `npm run typecheck` และ `npm run lint`

## โครงสร้าง

```
app/
  page.tsx                        "/" → redirect ไป /dashboard
  api/{auth,jobs,knowledge,ai}/   API routes (ตรวจ session ทุกตัว)
  login/  dashboard/{new,knowledge,ai}/
components/   AppShell, CountUp, ErrorBanner, FullPageSpinner, Toast
hooks/        useRequireAuth
lib/          auth, http (validation), api-client, supabase-admin, types
supabase/     supabase.sql
```
