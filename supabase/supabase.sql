-- Service Hub schema
-- รันใน Supabase → SQL Editor (รันซ้ำได้ ข้อมูลเดิมไม่หาย)

create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  customer text not null,
  machine text not null,
  error_code text,
  issue text not null,
  urgency text default 'normal',
  status text default 'Pending',
  tech text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists knowledge_base (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  machine_model text not null,
  error_code text,
  symptom text not null,
  solution text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- จำกัดค่าสถานะ/ความด่วนให้ตรงกับที่แอปใช้
alter table jobs drop constraint if exists jobs_status_check;
alter table jobs add constraint jobs_status_check
  check (status in ('Pending', 'In Progress', 'Done'));

alter table jobs drop constraint if exists jobs_urgency_check;
alter table jobs add constraint jobs_urgency_check
  check (urgency in ('normal', 'urgent'));

-- เปิด RLS โดยไม่สร้าง policy = บล็อกการเข้าถึงด้วย anon key ทั้งหมด
-- แอปอ่าน/เขียนผ่าน API route ฝั่งเซิร์ฟเวอร์ด้วย service key (ข้าม RLS) หลังตรวจ session เท่านั้น
alter table jobs enable row level security;
alter table knowledge_base enable row level security;

-- ข้อมูลแยกตามบัญชี: API กรองด้วย user_id (อีเมลเจ้าของ) ทุกครั้ง
-- index ช่วยให้ค้นหาตามเจ้าของเร็วขึ้น (รันซ้ำได้)
create index if not exists jobs_user_id_idx on jobs (user_id, created_at desc);
create index if not exists knowledge_base_user_id_idx on knowledge_base (user_id, created_at desc);
