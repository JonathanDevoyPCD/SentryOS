import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  CommandLineIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { navigation, pageTitles } from "./sentry/mock-data";
import SentryAIPage from "./sentry/ai/SentryAIPage";
import ReportsPage from "./sentry/ReportsPage";
import HomeMapPage from "./sentry/HomeMapPage";
import {
  DashboardPage,
  DevicesPage,
  GuestPage,
  InternetPage,
  LanPage,
  NetworkMapPage,
  ProtectionPage,
  ServicePage,
  SystemPage,
  WifiPage,
} from "./sentry/pages";
import "./sentry.css";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
        <ShieldCheckIcon className="h-6 w-6" />
        <span className="absolute inset-x-1 bottom-1 h-px bg-blue-300/60" />
      </div>
      <div><p className="text-lg font-semibold tracking-tight text-white">SentryOS</p><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Network command</p></div>
    </div>
  );
}

function Sidebar({ open, setOpen }) {
  return (
    <>
      <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-white/5 bg-slate-950 text-slate-300 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between px-5"><Brand /><button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Close menu"><XMarkIcon className="h-6 w-6" /></button></div>
        <div className="mx-4 mb-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-3 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />Internet online</div><p className="mt-1 pl-4 text-[11px] text-slate-500">Frogfoot · DHCP/IPoE</p></div>
        <nav className="sentry-scrollbar flex-1 overflow-y-auto px-3 pb-5" aria-label="Main navigation">
          {navigation.map((group) => <div key={group.label} className="mb-5"><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-600">{group.label}</p><div className="space-y-0.5">{group.items.map(({ label, path, icon: Icon, badge }) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-950/25" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon className="h-[19px] w-[19px] shrink-0" /><span className="flex-1">{label}</span>{badge && <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold">{badge}</span>}</NavLink>)}</div></div>)}
        </nav>
        <div className="border-t border-white/5 p-4"><div className="flex items-center gap-3 rounded-xl bg-white/[0.035] p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">JD</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-200">Local admin</p><p className="truncate text-[11px] text-slate-500">192.168.0.104</p></div><ArrowLeftOnRectangleIcon className="h-5 w-5 text-slate-500" /></div></div>
      </aside>
    </>
  );
}

function Header({ setSidebarOpen, notify }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Dashboard";
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setSidebarOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden" aria-label="Open menu"><Bars3Icon className="h-6 w-6" /></button><div className="min-w-0"><div className="hidden items-center gap-1 text-xs text-slate-400 sm:flex"><span>SentryOS</span><ChevronRightIcon className="h-3 w-3" /><span>Local router</span></div><h1 className="truncate text-xl font-semibold tracking-tight text-slate-950 sm:mt-0.5 sm:text-2xl">{title}</h1></div></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => notify("Command search is ready for router API integration")} className="hidden h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm transition hover:border-slate-300 sm:flex"><MagnifyingGlassIcon className="h-5 w-5" /><span className="hidden xl:inline">Search settings</span><kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 xl:inline">Ctrl K</kbd></button><button type="button" onClick={() => notify("You have no unread alerts")} className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-slate-300" aria-label="Notifications"><BellIcon className="h-5 w-5" /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" /></button><div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-slate-600">AC10U online</span></div></div>
      </div>
    </header>
  );
}

function PendingChanges({ count, onApply, onDiscard }) {
  if (!count) return null;
  return <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white shadow-2xl shadow-slate-950/35 sm:flex-row sm:items-center sm:px-4 lg:left-[286px]"><div className="flex flex-1 items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/10 text-amber-300"><CommandLineIcon className="h-5 w-5" /></span><div><p className="text-sm font-semibold">{count} unsaved {count === 1 ? "change" : "changes"}</p><p className="text-xs text-slate-400">Prototype actions stay in this browser session.</p></div></div><div className="flex gap-2"><button type="button" onClick={onDiscard} className="min-h-11 flex-1 rounded-xl px-4 text-sm font-semibold text-slate-300 hover:bg-white/5 sm:flex-none">Discard</button><button type="button" onClick={onApply} className="min-h-11 flex-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 sm:flex-none"><span className="inline-flex items-center gap-2"><CheckIcon className="h-4 w-4" />Apply safely</span></button></div></div>;
}

function Toast({ message, clear }) {
  useEffect(() => { if (!message) return undefined; const timer = window.setTimeout(clear, 3200); return () => window.clearTimeout(timer); }, [message, clear]);
  if (!message) return null;
  return <div role="status" className="fixed right-4 top-24 z-[70] flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl"><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckIcon className="h-4 w-4" /></span><span>{message}</span><button type="button" onClick={clear} className="ml-2 text-slate-400 hover:text-slate-700" aria-label="Dismiss notification"><XMarkIcon className="h-4 w-4" /></button></div>;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guestEnabled, setGuestEnabled] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [toast, setToast] = useState("");
  const markChanged = () => setPendingChanges((count) => count + 1);
  const changeGuest = (enabled) => { setGuestEnabled(enabled); markChanged(); };
  const notify = (message) => setToast(message);

  useEffect(() => {
    const handler = (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); notify("Command search is ready for router API integration"); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="min-h-screen lg:pl-[286px]">
        <Header setSidebarOpen={setSidebarOpen} notify={notify} />
        <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage guestEnabled={guestEnabled} setGuestEnabled={changeGuest} notify={notify} />} />
            <Route path="/network-map" element={<NetworkMapPage />} />
            <Route path="/home-map" element={<HomeMapPage notify={notify} />} />
            <Route path="/sentry-ai" element={<SentryAIPage markChanged={markChanged} notify={notify} />} />
            <Route path="/reports" element={<ReportsPage notify={notify} />} />
            <Route path="/internet" element={<InternetPage markChanged={markChanged} />} />
            <Route path="/wifi" element={<WifiPage markChanged={markChanged} />} />
            <Route path="/guest" element={<GuestPage guestEnabled={guestEnabled} setGuestEnabled={setGuestEnabled} markChanged={markChanged} />} />
            <Route path="/lan" element={<LanPage markChanged={markChanged} />} />
            <Route path="/devices" element={<DevicesPage notify={notify} />} />
            <Route path="/history" element={<DevicesPage notify={notify} history />} />
            <Route path="/firewall" element={<ProtectionPage notify={notify} markChanged={markChanged} />} />
            <Route path="/access-control" element={<ProtectionPage mode="access" notify={notify} markChanged={markChanged} />} />
            <Route path="/port-forwarding" element={<ProtectionPage mode="ports" notify={notify} markChanged={markChanged} />} />
            <Route path="/usb" element={<ServicePage type="usb" notify={notify} markChanged={markChanged} />} />
            <Route path="/vpn" element={<ServicePage type="vpn" notify={notify} markChanged={markChanged} />} />
            <Route path="/ddns" element={<ServicePage type="ddns" notify={notify} markChanged={markChanged} />} />
            <Route path="/system" element={<SystemPage notify={notify} markChanged={markChanged} />} />
            <Route path="/diagnostics" element={<SystemPage mode="diagnostics" notify={notify} markChanged={markChanged} />} />
            <Route path="/logs" element={<SystemPage mode="logs" notify={notify} markChanged={markChanged} />} />
            <Route path="/backup" element={<SystemPage mode="backup" notify={notify} markChanged={markChanged} />} />
            <Route path="/firmware" element={<SystemPage mode="firmware" notify={notify} markChanged={markChanged} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <footer className="px-6 pb-8 pt-2 text-center text-xs text-slate-400 xl:px-8"><p>SentryOS interface prototype · Local-first router management · No hardware changes are performed</p></footer>
      </div>
      <PendingChanges count={pendingChanges} onDiscard={() => { setPendingChanges(0); notify("Draft changes discarded"); }} onApply={() => { setPendingChanges(0); notify("Demo settings applied locally"); }} />
      <Toast message={toast} clear={() => setToast("")} />
    </div>
  );
}
