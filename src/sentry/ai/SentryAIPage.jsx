import { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import { routerApi } from "../api/router-api";
import { ACTION_RISK } from "./policy";
import { sentryAiClient } from "./sentry-ai-client";

const starters = [
  { label: "Check interference", prompt: "Check for Wi-Fi channel interference", icon: WifiIcon },
  { label: "Boost my connection", prompt: "Why is my connection slow and what can safely boost it?", icon: BoltIcon },
  { label: "Security check", prompt: "Check my network security and create a report", icon: ShieldCheckIcon },
  { label: "Prepare a report", prompt: "Create a weekly network health report", icon: CommandLineIcon },
];

const riskStyle = {
  [ACTION_RISK.OBSERVE]: { label: "Safe check", className: "bg-emerald-50 text-emerald-700", icon: CheckCircleIcon },
  [ACTION_RISK.CONFIRM]: { label: "Approval required", className: "bg-amber-50 text-amber-700", icon: ExclamationTriangleIcon },
  [ACTION_RISK.BLOCKED]: { label: "Blocked", className: "bg-rose-50 text-rose-700", icon: LockClosedIcon },
};

const findingStyle = {
  good: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
  warning: "border-amber-100 bg-amber-50/60 text-amber-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

function Surface({ children, className = "" }) {
  return <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white shadow-panel ${className}`}>{children}</section>;
}

function ActionCard({ action }) {
  const style = riskStyle[action.risk];
  const RiskIcon = style.icon;
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900">{action.label}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">{action.reason}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}><RiskIcon className="h-4 w-4" />{style.label}</span>
      </div>
      <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2">
        <p><span className="font-semibold text-slate-600">Impact:</span> <span className="text-slate-500">{action.impact}</span></p>
        <p><span className="font-semibold text-slate-600">Rollback:</span> <span className="text-slate-500">{action.rollback}</span></p>
      </div>
    </article>
  );
}

export default function SentryAIPage({ markChanged, notify }) {
  const [prompt, setPrompt] = useState("");
  const [snapshot, setSnapshot] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [checksRunning, setChecksRunning] = useState(false);
  const [checksComplete, setChecksComplete] = useState(false);

  useEffect(() => { routerApi.getSnapshot().then(setSnapshot).catch(() => setError("The simulated router snapshot could not be loaded.")); }, []);

  const confirmable = useMemo(() => analysis?.actions.filter((action) => action.risk === ACTION_RISK.CONFIRM) ?? [], [analysis]);
  const observable = useMemo(() => analysis?.actions.filter((action) => action.risk === ACTION_RISK.OBSERVE) ?? [], [analysis]);

  const runAnalysis = async (nextPrompt) => {
    const cleanPrompt = nextPrompt.trim();
    if (!cleanPrompt || busy) return;
    setPrompt("");
    setBusy(true);
    setError("");
    setConfirming(false);
    setChecksComplete(false);
    try {
      const result = await sentryAiClient.analyze(cleanPrompt, snapshot);
      setAnalysis({ ...result, prompt: cleanPrompt });
    } catch (requestError) {
      setError(requestError.message || "SentryAI could not complete the analysis.");
    } finally {
      setBusy(false);
    }
  };

  const runSafeChecks = async () => {
    if (!observable.length || checksRunning) return;
    setChecksRunning(true);
    try {
      await Promise.all(observable.map((action) => routerApi.runDiagnostic(action.id)));
      setChecksComplete(true);
      notify(`${observable.length} safe ${observable.length === 1 ? "check" : "checks"} completed in simulation mode`);
    } catch {
      setError("A safe diagnostic could not be completed.");
    } finally {
      setChecksRunning(false);
    }
  };

  const stageConfirmedActions = () => {
    confirmable.forEach(() => markChanged());
    setConfirming(false);
    notify(`${confirmable.length} SentryAI ${confirmable.length === 1 ? "change" : "changes"} staged in simulation mode`);
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-panel">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />SentryAI online · simulation mode</div>
            <h2 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">Ask your network what it needs.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">SentryAI can inspect simulated router data, explain problems and prepare reversible actions. Nothing reaches router hardware from this prototype.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.06] p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-400">Current context</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xl font-semibold">{snapshot?.health.score ?? "—"}</p><p className="text-xs text-slate-400">Health</p></div>
              <div><p className="text-xl font-semibold">{snapshot?.wan.latencyMs ?? "—"}<span className="text-xs"> ms</span></p><p className="text-xs text-slate-400">Latency</p></div>
              <div><p className="text-xl font-semibold">{snapshot?.clients.online ?? "—"}</p><p className="text-xs text-slate-400">Devices</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.65fr)]">
        <Surface className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><SparklesIcon className="h-5 w-5" /></span><div><h3 className="font-semibold text-slate-900">Network command centre</h3><p className="text-sm text-slate-500">Describe the result you want in plain language.</p></div></div>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            {!analysis && !busy && (
              <div>
                <p className="text-sm leading-6 text-slate-600">I can safely analyse performance, radio conditions and security. Start with one of these:</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">{starters.map(({ label, prompt: starterPrompt, icon: Icon }) => <button key={label} type="button" onClick={() => runAnalysis(starterPrompt)} className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 p-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/40"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon className="h-5 w-5" /></span><span className="flex-1">{label}</span><ChevronRightIcon className="h-4 w-4 text-slate-400" /></button>)}</div>
              </div>
            )}

            {busy && <div className="flex min-h-48 flex-col items-center justify-center text-center"><ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" /><p className="mt-3 font-semibold text-slate-800">Analysing the local snapshot</p><p className="mt-1 text-sm text-slate-500">Applying the deterministic SentryOS safety policy…</p></div>}

            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

            {analysis && !busy && (
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-[.13em] text-slate-400">Your request</p><p className="mt-1 font-medium text-slate-800">{analysis.prompt}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[.13em] text-blue-600">SentryAI analysis</p><p className="mt-2 text-[15px] leading-7 text-slate-700">{analysis.summary}</p></div>
                <div className="grid gap-3 sm:grid-cols-3">{analysis.findings.map((finding) => <div key={finding.label} className={`rounded-xl border p-3 ${findingStyle[finding.tone]}`}><p className="text-xs font-medium opacity-75">{finding.label}</p><p className="mt-1 text-sm font-semibold">{finding.value}</p></div>)}</div>
                <div><div className="mb-3 flex items-center justify-between"><h4 className="font-semibold text-slate-900">Proposed action plan</h4><span className="text-xs font-medium text-slate-400">{analysis.actions.length} actions</span></div><div className="space-y-3">{analysis.actions.map((action) => <ActionCard key={`${analysis.id}-${action.id}`} action={action} />)}</div></div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {observable.length > 0 && <button type="button" onClick={runSafeChecks} disabled={checksRunning || checksComplete} className="min-h-11 flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-default disabled:opacity-70">{checksRunning ? "Running safe checks…" : checksComplete ? "Safe checks complete" : `Run ${observable.length} safe ${observable.length === 1 ? "check" : "checks"}`}</button>}
                  {confirmable.length > 0 && analysis.canStage && !confirming && <button type="button" onClick={() => setConfirming(true)} className="min-h-11 flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Review {confirmable.length} proposed {confirmable.length === 1 ? "change" : "changes"}</button>}
                </div>
                {!analysis.canStage && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span className="font-semibold">Plan blocked:</span> at least one proposed action is outside the SentryOS allowlist. No configuration action can be staged from this response.</div>}
                {confirmable.length > 0 && analysis.canStage && confirming && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="font-semibold text-amber-900">Confirm simulated staging</p><p className="mt-1 text-sm leading-6 text-amber-800">This will add the proposed changes to the local pending-changes bar. No router command or external API call will occur.</p></div></div><div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setConfirming(false)} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100">Cancel</button><button type="button" onClick={stageConfirmedActions} className="min-h-11 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700">Confirm and stage</button></div></div>}
              </div>
            )}

            <form onSubmit={(event) => { event.preventDefault(); runAnalysis(prompt); }} className="border-t border-slate-100 pt-5">
              <label htmlFor="sentry-prompt" className="sr-only">Ask SentryAI</label>
              <div className="flex flex-col gap-2 sm:flex-row"><input id="sentry-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask SentryAI to check, explain or optimise…" className="form-control flex-1" /><button type="submit" disabled={!prompt.trim() || busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"><PaperAirplaneIcon className="h-4 w-4" />Analyse</button></div>
            </form>
          </div>
        </Surface>

        <div className="space-y-5">
          <Surface className="p-5">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheckIcon className="h-5 w-5" /></span><div><h3 className="font-semibold text-slate-900">Guardrails active</h3><p className="text-sm text-slate-500">Default-deny action policy</p></div></div>
            <div className="mt-5 space-y-4">
              <div className="flex gap-3"><CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /><div><p className="text-sm font-semibold text-slate-800">Safe checks can run</p><p className="mt-0.5 text-xs leading-5 text-slate-500">Status, radio scans, DNS tests and reports.</p></div></div>
              <div className="flex gap-3"><ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><div><p className="text-sm font-semibold text-slate-800">Changes need approval</p><p className="mt-0.5 text-xs leading-5 text-slate-500">Impact and rollback are shown before staging.</p></div></div>
              <div className="flex gap-3"><LockClosedIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" /><div><p className="text-sm font-semibold text-slate-800">Firmware stays blocked</p><p className="mt-0.5 text-xs leading-5 text-slate-500">No flashing or bootloader action is available.</p></div></div>
            </div>
          </Surface>

          <Surface className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[.13em] text-slate-400">Privacy boundary</p>
            <h3 className="mt-2 font-semibold text-slate-900">Your API key stays server-side</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">The future local SentryOS service will sanitise router data and call your chosen AI provider. This browser prototype contains no secret and makes no AI request.</p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-600">browser → local SentryOS API<br />policy → router adapter</div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
