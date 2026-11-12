"use client";

import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { BookOpen, Check, Copy, Loader2, Plus, Save, Search, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { useToast } from "@/components/Toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiRequest, errorMessage } from "@/lib/api-client";
import type { KnowledgeItem } from "@/lib/types";

const EMPTY_FORM = { machine_model: "", error_code: "", symptom: "", solution: "" };

export default function KnowledgePage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const toast = useToast();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const data = await apiRequest<{ items: KnowledgeItem[] }>("/api/knowledge");
      setItems(data.items);
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadItems();
  }, [isAuthenticated, loadItems]);

  const setField = (field: keyof typeof EMPTY_FORM) => (value: string) =>
    setFormData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest("/api/knowledge", { method: "POST", body: formData });
      setFormData(EMPTY_FORM);
      setShowForm(false);
      await loadItems();
      toast.success("บันทึกความรู้ใหม่แล้ว");
    } catch (error) {
      toast.error("บันทึกไม่สำเร็จ: " + errorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบข้อมูลนี้ใช่ไหม?")) return;
    try {
      await apiRequest("/api/knowledge", { method: "DELETE", body: { id } });
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("ลบข้อมูลแล้ว");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleCopy = async (item: KnowledgeItem) => {
    try {
      await navigator.clipboard.writeText(item.solution);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 1500);
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  if (isLoading || !isAuthenticated || loading) return <FullPageSpinner />;

  const term = searchTerm.trim().toLowerCase();
  const filtered = items.filter((item) =>
    [item.machine_model, item.error_code, item.symptom].some((value) => value?.toLowerCase().includes(term)),
  );

  return (
    <AppShell
      title="คลังความรู้"
      subtitle="อาการเสียและวิธีแก้ที่เคยเจอ แยกตามรุ่นเครื่อง"
      actions={
        <button onClick={() => setShowForm((show) => !show)} className={`btn ${showForm ? "btn-line" : "btn-primary"}`}>
          {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "ปิดฟอร์ม" : "เพิ่มความรู้ใหม่"}
        </button>
      }
    >
      <div className="space-y-6">
        {loadError && <ErrorBanner message={loadError} onRetry={loadItems} />}

        <div className={`grid transition-[grid-template-rows] duration-300 ${showForm ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden" inert={!showForm}>
            <form onSubmit={handleSubmit} className="card space-y-4 p-5 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input required maxLength={200} placeholder="รุ่นเครื่อง (เช่น Toyota 8FBE)" value={formData.machine_model} onChange={(e) => setField("machine_model")(e.target.value)} className="input" />
                <input maxLength={50} placeholder="Error Code (ถ้ามี)" value={formData.error_code} onChange={(e) => setField("error_code")(e.target.value)} className="input" />
              </div>
              <input required maxLength={1000} placeholder="อาการเสีย / ปัญหา" value={formData.symptom} onChange={(e) => setField("symptom")(e.target.value)} className="input" />
              <textarea required rows={3} maxLength={5000} placeholder="วิธีแก้ไข" value={formData.solution} onChange={(e) => setField("solution")(e.target.value)} className="input" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-line">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-dark">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหารุ่นเครื่อง Error Code หรืออาการ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-11"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="card col-span-full py-14 text-center text-slate-400">
              <BookOpen className="mx-auto mb-2" size={32} strokeWidth={1.5} />
              {items.length === 0 ? "ยังไม่มีข้อมูล กด “เพิ่มความรู้ใหม่” เพื่อบันทึกวิธีแก้แรก" : "ไม่พบข้อมูลที่ตรงกับคำค้นหา"}
            </div>
          ) : (
            filtered.map((item, i) => (
              <article
                key={item.id}
                style={{ "--d": `${Math.min(i, 10) * 40}ms` } as CSSProperties}
                className="rise card group relative overflow-hidden p-5 pl-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="absolute inset-y-0 left-0 w-1.5 bg-hazard transition-all group-hover:w-2.5" aria-hidden="true" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{item.machine_model}</h3>
                    {item.error_code && (
                      <span className="mt-1 inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-signal">
                        Error {item.error_code}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => handleCopy(item)}
                      aria-label="คัดลอกวิธีแก้"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-bone hover:text-ink active:scale-90"
                    >
                      {copiedId === item.id ? <Check size={17} className="text-emerald-600" /> : <Copy size={17} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      aria-label="ลบข้อมูล"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-signal active:scale-90"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-semibold text-ink">อาการ</span> {item.symptom}
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-bone px-3 py-2 text-sm text-slate-700">
                  <span className="font-semibold text-ink">วิธีแก้</span> {item.solution}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
