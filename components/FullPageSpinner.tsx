import { Forklift } from "lucide-react";

export function FullPageSpinner({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <div className={`flex min-h-screen flex-col items-center justify-center gap-5 ${isDark ? "bg-ink" : "bg-bone"}`}>
      <Forklift className="lift text-hazard" size={44} strokeWidth={1.75} />
      <div className="stripes stripes-move h-1.5 w-28 rounded-full" />
      <span className="sr-only">กำลังโหลด</span>
    </div>
  );
}
