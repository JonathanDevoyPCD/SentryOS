import { useEffect, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentChartBarIcon,
  PlusIcon,
  ShieldCheckIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import { routerApi } from "./api/router-api";

const reportTypes = [
  { type: "Health", title: "Network health", detail: "Availability, latency, radios and device trends", icon: ChartBarSquareIcon, tone: "bg-blue-50 text-blue-600" },
  { type: "Wireless", title: "Wi-Fi environment", detail: "Channel congestion, utilisation and signal quality", icon: WifiIcon, tone: "bg-violet-50 text-violet-600" },
  { type: "Security", title: "Security posture", detail: "Firewall, access rules and administration events", icon: ShieldCheckIcon, tone: "bg-emerald-50 text-emerald-600" },
];

export default function ReportsPage({ notify }) {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState("");

  useEffect(() => { routerApi.getReports().then(setReports).catch(() => notify("Reports could not be loaded")); }, [notify]);

  const generate = async (type) => {
    setGenerating(type);
    try {
      const report = await routerApi.generateReport(type);
      setReports((current) => [report, ...current]);
      notify(`${type} report generated from simulated data`);
    } finally {
      setGenerating("");
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><DocumentChartBarIcon className="h-6 w-6" /></span><div><h2 className="text-xl font-semibold text-slate-950">Network reports</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Create clear local summaries from router health and SentryAI observations. Current reports use simulated data.</p></div></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"><span className="h-2 w-2 rounded-full bg-amber-500" />Simulation mode</span>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">{reportTypes.map(({ type, title, detail, icon: Icon, tone }) => <section key={type} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-6 w-6" /></span><h3 className="mt-4 font-semibold text-slate-900">{title}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{detail}</p><button type="button" onClick={() => generate(type)} disabled={Boolean(generating)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60">{generating === type ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}{generating === type ? "Generating…" : "Generate report"}</button></section>)}</div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="font-semibold text-slate-900">Recent reports</h3><p className="mt-1 text-sm text-slate-500">Stored locally in the future router service.</p></div><span className="text-xs font-medium text-slate-400">{reports.length} available</span></div>
        <div className="divide-y divide-slate-100">
          {reports.length === 0 ? <div className="flex min-h-40 items-center justify-center"><ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600" /><span className="ml-3 text-sm text-slate-500">Loading reports…</span></div> : reports.map((report) => <article key={report.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><DocumentChartBarIcon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-slate-900">{report.title}</h4><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{report.type}</span></div><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500"><ClockIcon className="h-3.5 w-3.5" />{report.createdAt}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><p className="text-lg font-semibold text-slate-900">{report.score}</p><p className="text-[11px] text-slate-400">Health score</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${report.status === "Ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><CheckCircleIcon className="h-3.5 w-3.5" />{report.status}</span><button type="button" onClick={() => notify("Report export will be connected to local storage")} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300" aria-label={`Export ${report.title}`}><ArrowDownTrayIcon className="h-5 w-5" /></button></div></article>)}
        </div>
      </section>
    </div>
  );
}
