"use client";

import { useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { BookOpen, Forklift, Sparkles, Wrench } from "lucide-react";
import { FullPageSpinner } from "@/components/FullPageSpinner";

const FEATURES = [
  { icon: Wrench, text: "เปิดใบงานและติดตามสถานะซ่อม" },
  { icon: BookOpen, text: "เก็บอาการเสียและวิธีแก้ตามรุ่นเครื่อง" },
  { icon: Sparkles, text: "ถาม AI ช่วยวิเคราะห์อาการ" },
];

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <FullPageSpinner variant="dark" />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-hazard text-ink">
            <Forklift size={26} />
          </span>
          <span className="font-display text-2xl font-semibold">Service Hub</span>
        </div>

        <div>
          <Forklift className="lift mb-8 text-hazard" size={96} strokeWidth={1.25} />
          <h2 className="font-display text-5xl font-semibold leading-tight">
            ใบงาน อาการเสีย
            <br />
            และวิธีแก้ อยู่ที่เดียว
          </h2>
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <li key={text} className="rise flex items-center gap-3 text-slate-300" style={{ "--d": `${300 + i * 120}ms` } as CSSProperties}>
                <Icon size={20} className="text-hazard" /> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="stripes stripes-move absolute inset-x-0 bottom-0 h-3" aria-hidden="true" />
      </section>

      <section className="flex items-center justify-center bg-bone px-6 py-12">
        <div className="rise w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-hazard text-ink">
              <Forklift size={24} />
            </span>
            <span className="font-display text-xl font-semibold">Service Hub</span>
          </div>

          <h1 className="font-display text-3xl font-semibold">เข้าสู่ระบบ</h1>
          <p className="mb-8 mt-2 text-slate-500">ใช้บัญชี Google เพื่อจัดการงานซ่อมบำรุง</p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white py-3.5 font-semibold text-ink shadow-[0_3px_0_0_#dcded6] transition hover:border-ink active:translate-y-[2px] active:shadow-none"
          >
            <svg className="h-6 w-6 transition group-hover:scale-110" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
      </section>
    </div>
  );
}
