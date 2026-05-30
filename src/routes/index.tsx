import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { getTrsStats } from "@/lib/trs.functions";
import { ThailandMap } from "@/components/ThailandMap";

const trsQueryOptions = queryOptions({
  queryKey: ["trs-stats"],
  queryFn: () => getTrsStats(),
  refetchInterval: 5 * 60 * 1000, // 5 minutes
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRS Matching Dashboard" },
      { name: "description", content: "Live dashboard for TRS Matching — auto-refresh every 5 minutes from Google Sheet." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trsQueryOptions),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1228] text-slate-200 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">โหลดข้อมูลไม่สำเร็จ</h1>
        <p className="mt-2 text-sm text-slate-400">{error.message}</p>
      </div>
    </div>
  ),
});

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div
      className="rounded-lg border p-5 backdrop-blur-sm"
      style={{
        background: "linear-gradient(180deg, rgba(16,28,58,0.85), rgba(10,18,40,0.85))",
        borderColor: accent,
        boxShadow: `0 0 24px -8px ${accent}`,
      }}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-2 text-4xl font-bold tabular-nums text-white">{value}</div>
    </div>
  );
}

function TopList({
  title,
  items,
}: {
  title: string;
  items: { name: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-5 h-full">
      <h3 className="mb-4 text-sm font-semibold text-cyan-300">{title}</h3>
      <ol className="space-y-2">
        {items.map((item, idx) => (
          <li key={item.name} className="flex items-center gap-3 text-sm">
            <span className="w-5 text-right text-slate-500 tabular-nums">{idx + 1}</span>
            <span className="flex-1 truncate text-slate-200" title={item.name}>{item.name}</span>
            <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-800 xl:block">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right font-semibold tabular-nums text-cyan-300">
              {item.count}
            </span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-slate-500">ไม่มีข้อมูล</li>
        )}
      </ol>
    </div>
  );
}

function DashboardContent() {
  const { data } = useSuspenseQuery(trsQueryOptions);
  const fetched = new Date(data.fetchedAt);

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(56,189,248,0.10), transparent), radial-gradient(1000px 500px at 100% 10%, rgba(168,85,247,0.10), transparent), #060b1c",
      }}
    >
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">TRS Matching Dashboard</h1>
          <p className="text-xs text-slate-400">
            ข้อมูลจาก Google Sheet · อัปเดตอัตโนมัติทุก 5 นาที · ดึงล่าสุด{" "}
            {fetched.toLocaleString("th-TH")}
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Live
        </span>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="ผู้ลงทะเบียนทั้งหมด" value={data.total} accent="rgba(56,189,248,0.45)" />
        <StatCard label="เปิดใช้งาน (on)" value={data.active} accent="rgba(34,197,94,0.45)" />
        <StatCard label="วิชา (subjects)" value={data.subjects} accent="rgba(234,179,8,0.45)" />
        <StatCard label="จำนวนจังหวัด" value={data.provinces} accent="rgba(168,85,247,0.45)" />
      </section>

      {/* 3-column layout: Map 40% | Top Areas 30% | Top Provinces 30% */}
      <section className="grid gap-4 lg:grid-cols-10">
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-5 lg:col-span-4">
          <h3 className="mb-3 text-sm font-semibold text-cyan-300">
            แผนที่ความต้องการย้ายตามภูมิภาค
          </h3>
          <ThailandMap provinceCounts={data.provinceCounts} />
        </div>
        <div className="lg:col-span-3">
          <TopList title="TOP 10 เขตที่ต้องการมากที่สุด" items={data.topTargetAreas} />
        </div>
        <div className="lg:col-span-3">
          <TopList title="TOP 10 จังหวัดที่ต้องการมากที่สุด" items={data.topTargetProvinces} />
        </div>
      </section>

      {/* Province tags moved to full-width footer row */}
      <section className="mt-6 rounded-lg border border-slate-800/80 bg-slate-950/60 p-5">
        <h3 className="mb-3 text-sm font-semibold text-cyan-300">
          รายชื่อจังหวัดที่ปรากฏในข้อมูล ({data.provinceList.length}/77)
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.provinceList.map((p) => (
            <span
              key={p}
              className="rounded-md border border-slate-700/60 bg-slate-900/80 px-2 py-1 text-xs text-slate-300"
            >
              {p}
              {data.provinceCounts[p] ? (
                <span className="ml-1 text-cyan-300 font-semibold">{data.provinceCounts[p]}</span>
              ) : null}
            </span>
          ))}
        </div>
      </section>

      <footer className="mt-6 text-center text-xs text-slate-600">
        นับจังหวัดอ้างอิงรายชื่อทางการของประเทศไทย 77 จังหวัด · ข้อมูลสดจาก Google Sheet
      </footer>
    </div>
  );
}

function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060b1c] text-slate-400 flex items-center justify-center">กำลังโหลด…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
