"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CountUp } from "@/components/CountUp";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { useToast } from "@/components/Toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiRequest, errorMessage } from "@/lib/api-client";
import { JOB_STATUSES, type Job, type JobStatus } from "@/lib/types";

type Filter = JobStatus | "urgent";

const STATUS_LABEL: Record<JobStatus, string> = {
  Pending: "งานค้าง",
  "In Progress": "กำลังทำ",
  Done: "เสร็จแล้ว",
};

const STATUS_STYLES: Record<JobStatus, string> = {
  Pending: "bg-amber-100 text-amber-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Done: "bg-emerald-100 text-emerald-800",
};

const FILTER_LABEL: Record<Filter, string> = { ...STATUS_LABEL, urgent: "งานด่วนที่ยังไม่เสร็จ" };

const CARDS: { key: Filter; title: string; icon: LucideIcon; tone: string }[] = [
  { key: "Pending", title: "งานค้าง", icon: Clock, tone: "bg-amber-100 text-amber-700" },
  { key: "In Progress", title: "กำลังทำ", icon: Wrench, tone: "bg-blue-100 text-blue-700" },
  { key: "Done", title: "เสร็จแล้ว", icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
  { key: "urgent", title: "งานด่วน (ยังไม่เสร็จ)", icon: AlertCircle, tone: "bg-red-100 text-red-700" },
];

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<Filter | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const data = await apiRequest<{ jobs: Job[] }>("/api/jobs");
      setJobs(data.jobs);
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadJobs();
  }, [isAuthenticated, loadJobs]);

  const updateJobStatus = (id: string, status: JobStatus) =>
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status } : job)));

  const handleStatusChange = async (id: string, newStatus: JobStatus) => {
    const previous = jobs.find((job) => job.id === id)?.status;
    updateJobStatus(id, newStatus); // อัปเดตหน้าจอทันที แล้วย้อนกลับถ้าบันทึกไม่สำเร็จ
    try {
      await apiRequest("/api/jobs", { method: "PUT", body: { id, status: newStatus } });
      toast.success(`เปลี่ยนสถานะเป็น "${STATUS_LABEL[newStatus]}" แล้ว`);
    } catch (error) {
      if (previous) updateJobStatus(id, previous);
      toast.error(errorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบงานนี้ใช่ไหม?")) return;
    try {
      await apiRequest("/api/jobs", { method: "DELETE", body: { id } });
      setJobs((current) => current.filter((job) => job.id !== id));
      toast.success("ลบงานแล้ว");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (isLoading || !isAuthenticated || loading) return <FullPageSpinner />;

  const isUrgentOpen = (job: Job) => job.urgency === "urgent" && job.status !== "Done";
  const countFor = (key: Filter) =>
    key === "urgent" ? jobs.filter(isUrgentOpen).length : jobs.filter((job) => job.status === key).length;

  const term = searchTerm.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === null || (filter === "urgent" ? isUrgentOpen(job) : job.status === filter);
    const matchesTerm = [job.customer, job.machine, job.error_code, job.issue].some((value) =>
      value?.toLowerCase().includes(term),
    );
    return matchesFilter && matchesTerm;
  });

  return (
    <AppShell
      title="ภาพรวมงานทั้งหมด"
      subtitle={`${jobs.length} ใบงานในระบบ`}
      actions={
        <Link href="/dashboard/new" className="btn btn-primary">
          <Plus size={18} /> เพิ่มงานใหม่
        </Link>
      }
    >
      <div className="space-y-6">
        {loadError && <ErrorBanner message={loadError} onRetry={loadJobs} />}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {CARDS.map(({ key, title, icon: Icon, tone }, i) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(active ? null : key)}
                aria-pressed={active}
                style={{ "--d": `${i * 70}ms` } as CSSProperties}
                className={`rise card group flex flex-col items-start gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md md:p-5 ${
                  active ? "border-ink ring-2 ring-hazard" : ""
                }`}
              >
                <span className={`rounded-lg p-2.5 transition group-hover:scale-110 ${tone}`}>
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block font-display text-4xl font-semibold leading-none">
                    <CountUp value={countFor(key)} />
                  </span>
                  <span className="mt-1.5 block text-sm text-slate-500">{title}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <h2 className="mr-auto font-display text-lg font-semibold">รายการงานล่าสุด</h2>
            {filter && (
              <button
                onClick={() => setFilter(null)}
                className="pop flex items-center gap-1.5 rounded-full bg-hazard-soft px-3 py-1.5 text-sm font-medium"
              >
                กรอง: {FILTER_LABEL[filter]} <X size={14} />
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาลูกค้า รุ่น หรือ Error"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input py-2 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bone font-medium text-slate-600">
                <tr>
                  <th className="px-4 py-3">ลูกค้า</th>
                  <th className="px-4 py-3">รุ่นเครื่อง</th>
                  <th className="px-4 py-3">Error</th>
                  <th className="px-4 py-3">อาการ</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-slate-400">
                      <Inbox className="mx-auto mb-2" size={32} strokeWidth={1.5} />
                      {jobs.length === 0 ? "ยังไม่มีงานในระบบ กด “เพิ่มงานใหม่” เพื่อเริ่มต้น" : "ไม่พบงานที่ตรงกับเงื่อนไข"}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, i) => (
                    <tr
                      key={job.id}
                      style={{ "--d": `${Math.min(i, 12) * 30}ms` } as CSSProperties}
                      className="rise transition hover:bg-hazard-soft/40"
                    >
                      <td
                        className={`px-4 py-3 font-medium ${
                          job.urgency === "urgent" ? "shadow-[inset_4px_0_0_var(--color-signal)]" : ""
                        }`}
                      >
                        {job.customer}
                        {job.urgency === "urgent" && (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">ด่วน</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{job.machine}</td>
                      <td className="px-4 py-3 font-semibold text-signal">{job.error_code || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="block max-w-[220px] truncate" title={job.issue}>
                          {job.issue}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value as JobStatus)}
                          aria-label="สถานะงาน"
                          className={`cursor-pointer rounded-full border-none px-3 py-1 text-xs font-semibold transition hover:brightness-95 focus:ring-2 focus:ring-hazard ${STATUS_STYLES[job.status]}`}
                        >
                          {JOB_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(job.id)}
                          aria-label="ลบงาน"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-signal active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
