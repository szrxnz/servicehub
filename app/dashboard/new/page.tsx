"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { useToast } from "@/components/Toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiRequest, errorMessage } from "@/lib/api-client";

const EMPTY_FORM = { customer: "", machine: "", error_code: "", issue: "", urgency: "normal" };
const ISSUE_MAX = 2000;

export default function NewJobPage() {
  const router = useRouter();
  const toast = useToast();
  const { isLoading, isAuthenticated } = useRequireAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest("/api/jobs", { method: "POST", body: formData });
      toast.success("บันทึกใบงานแล้ว");
      router.push("/dashboard");
    } catch (error) {
      toast.error("บันทึกไม่สำเร็จ: " + errorMessage(error));
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated) return <FullPageSpinner />;

  const isUrgent = formData.urgency === "urgent";

  return (
    <AppShell title="เปิดใบงานใหม่" subtitle="กรอกข้อมูลเครื่องและอาการที่ลูกค้าแจ้ง">
      <form onSubmit={handleSubmit} className="rise card mx-auto max-w-3xl space-y-6 p-5 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="ชื่อลูกค้า / บริษัท">
            <input required name="customer" value={formData.customer} onChange={handleChange} maxLength={200} className="input" placeholder="เช่น บริษัท ABC" />
          </Field>
          <Field label="รุ่นเครื่อง">
            <input required name="machine" value={formData.machine} onChange={handleChange} maxLength={200} className="input" placeholder="เช่น Toyota 8FBE" />
          </Field>
          <Field label="Error Code (ถ้ามี)">
            <input name="error_code" value={formData.error_code} onChange={handleChange} maxLength={50} className="input" placeholder="เช่น 05, 12" />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">ความด่วน</span>
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-bone p-1.5">
              <button
                type="button"
                aria-pressed={!isUrgent}
                onClick={() => setFormData((c) => ({ ...c, urgency: "normal" }))}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  !isUrgent ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"
                }`}
              >
                <CheckCircle2 size={16} /> ปกติ
              </button>
              <button
                type="button"
                aria-pressed={isUrgent}
                onClick={() => setFormData((c) => ({ ...c, urgency: "urgent" }))}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isUrgent ? "bg-signal text-white shadow-sm" : "text-slate-500 hover:text-ink"
                }`}
              >
                <AlertCircle size={16} /> ด่วน (เครื่องจอด)
              </button>
            </div>
          </div>
        </div>

        <Field label="อาการเสีย / ปัญหาที่แจ้ง">
          <textarea required name="issue" value={formData.issue} onChange={handleChange} rows={5} maxLength={ISSUE_MAX} className="input" placeholder="อธิบายอาการเสีย เช่น ยกไม่ขึ้น มีเสียงดังตอนเลี้ยว" />
          <span className="mt-1 block text-right text-xs text-slate-400">
            {formData.issue.length}/{ISSUE_MAX}
          </span>
        </Field>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <Link href="/dashboard" className="btn btn-line">
            ยกเลิก
          </Link>
          <button type="submit" disabled={isSaving} className="btn btn-primary">
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} /> กำลังบันทึก
              </>
            ) : (
              <>
                <Save size={18} /> บันทึกใบงาน
              </>
            )}
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
