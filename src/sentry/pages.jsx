import { useMemo, useState } from "react";
import ChartModule from "react-apexcharts";
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BoltIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CircleStackIcon,
  ClockIcon,
  CloudArrowDownIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  KeyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PlayIcon,
  PlusIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  SignalIcon,
  SignalSlashIcon,
  Squares2X2Icon,
  TvIcon,
  UserGroupIcon,
  WifiIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { activity, devices, trafficOptions, trafficSeries } from "./mock-data";

const Chart = ChartModule.default ?? ChartModule;

export function StatusDot({ tone = "green", pulse = false }) {
  const tones = { green: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500", red: "bg-rose-500", slate: "bg-slate-400" };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${tones[tone]} ${pulse ? "animate-pulse" : ""}`} aria-hidden="true" />;
}

function Panel({ children, className = "" }) {
  return <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white shadow-panel ${className}`}>{children}</section>;
}

function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div><h2 className="text-base font-semibold text-slate-900">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled = false, className = "" }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}>{children}</button>;
}

function SecondaryButton({ children, onClick, className = "" }) {
  return <button type="button" onClick={onClick} className={`min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 ${className}`}>{children}</button>;
}

function Toggle({ enabled, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={enabled} aria-label={label} onClick={() => onChange(!enabled)} className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${enabled ? "bg-blue-600" : "bg-slate-300"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? "left-6" : "left-1"}`} />
    </button>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone = "blue", trend }) {
  const tones = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600" };
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p></div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-6 w-6" /></div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">{trend && <span className="font-semibold text-emerald-600">{trend}</span>}<span>{detail}</span></div>
    </Panel>
  );
}

const deviceIcons = { Laptop: ComputerDesktopIcon, "Smart TV": TvIcon, Phone: DevicePhoneMobileIcon, Printer: CircleStackIcon, IoT: Squares2X2Icon };

function DeviceTable({ limit }) {
  const visibleDevices = limit ? devices.slice(0, limit) : devices;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead><tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Device</th><th className="px-4 py-3">Connection</th><th className="px-4 py-3">IP address</th><th className="px-4 py-3">Link speed</th><th className="px-4 py-3">Usage today</th><th className="px-5 py-3 text-right sm:px-6">Status</th></tr></thead>
        <tbody>{visibleDevices.map((device) => {
          const Icon = deviceIcons[device.type] ?? DevicePhoneMobileIcon;
          return <tr key={device.ip} className="border-b border-slate-50 text-sm last:border-0 hover:bg-slate-50/70"><td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon className="h-5 w-5" /></span><div><p className="font-semibold text-slate-800">{device.name}</p><p className="text-xs text-slate-400">{device.type}</p></div></div></td><td className="px-4 py-4 text-slate-600">{device.connection}</td><td className="px-4 py-4 font-mono text-xs text-slate-600">{device.ip}</td><td className="px-4 py-4 text-slate-600">{device.speed}</td><td className="px-4 py-4 text-slate-600">{device.traffic}</td><td className="px-5 py-4 text-right sm:px-6"><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><StatusDot />{device.status}</span></td></tr>;
        })}</tbody>
      </table>
    </div>
  );
}

export function DashboardPage({ guestEnabled, setGuestEnabled, notify }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Internet" value="Online" detail="Frogfoot · DHCP/IPoE" icon={GlobeAltIcon} tone="green" trend="Stable" />
        <MetricCard label="Connected devices" value="8" detail="5 wireless · 3 wired" icon={UserGroupIcon} tone="blue" trend="+2" />
        <MetricCard label="Download now" value="42.8 Mbps" detail="of 100 Mbps plan" icon={ArrowDownIcon} tone="violet" />
        <MetricCard label="Router health" value="Excellent" detail="Uptime 14d 07h 22m" icon={ShieldCheckIcon} tone="amber" />
      </div>

      <Panel className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="min-w-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><StatusDot pulse /><p className="text-sm font-semibold text-emerald-700">Everything is running normally</p></div><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Your network at a glance</h2><p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">SentryOS is monitoring the internet connection, wireless radios and local devices.</p></div><button type="button" onClick={() => notify("Fresh network status received") } className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Refresh network status"><ArrowPathIcon className="h-5 w-5" /></button></div>
            <div className="mt-7 flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {[{ icon: GlobeAltIcon, label: "Internet", detail: "Frogfoot", tone: "green" }, { icon: ShieldCheckIcon, label: "SentryOS", detail: "AC10U", tone: "blue" }, { icon: WifiIcon, label: "Wi-Fi", detail: "2.4 + 5 GHz", tone: "blue" }, { icon: UserGroupIcon, label: "Devices", detail: "8 online", tone: "green" }].map((node, index, all) => <div key={node.label} className="contents"><div className="min-w-[100px] text-center"><div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${node.tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}><node.icon className="h-7 w-7" /></div><p className="mt-2 text-sm font-semibold text-slate-800">{node.label}</p><p className="text-xs text-slate-400">{node.detail}</p></div>{index < all.length - 1 && <div className="h-px min-w-6 flex-1 bg-slate-200"><span className="sr-only">connects to</span></div>}</div>)}
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-950 p-5 text-white sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Live connection</p><div className="mt-4 flex items-end gap-3"><p className="text-4xl font-semibold tracking-tight">100</p><p className="pb-1 text-sm text-slate-400">Mbps down</p></div>
            <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/5 p-4"><ArrowDownIcon className="h-5 w-5 text-blue-300" /><p className="mt-3 text-xl font-semibold">42.8</p><p className="text-xs text-slate-400">Mbps download</p></div><div className="rounded-xl bg-white/5 p-4"><ArrowUpIcon className="h-5 w-5 text-sky-300" /><p className="mt-3 text-xl font-semibold">11.2</p><p className="text-xs text-slate-400">Mbps upload</p></div></div>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><ClockIcon className="h-4 w-4" />Last checked a few seconds ago</p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Panel><PanelHeader title="Network traffic" subtitle="Combined WAN traffic over the last 24 hours" action={<button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View report</button>} /><div className="px-3 pb-2 pt-3 sm:px-5"><Chart options={trafficOptions} series={trafficSeries} type="area" height={285} /></div></Panel>
        <Panel><PanelHeader title="Quick controls" subtitle="Common network actions" /><div className="divide-y divide-slate-100 px-5 sm:px-6"><div className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold text-slate-800">Guest Wi-Fi</p><p className="text-xs text-slate-500">SentryOS Guest · isolated</p></div><Toggle enabled={guestEnabled} onChange={setGuestEnabled} label="Toggle guest Wi-Fi" /></div><button type="button" onClick={() => notify("Speed test started — simulated result: 94 / 18 Mbps") } className="flex min-h-14 w-full items-center justify-between py-3 text-left"><span className="flex items-center gap-3 text-sm font-semibold text-slate-700"><BoltIcon className="h-5 w-5 text-amber-500" />Run speed test</span><ChevronRightIcon className="h-4 w-4 text-slate-400" /></button><button type="button" onClick={() => notify("Network scan complete — no new devices") } className="flex min-h-14 w-full items-center justify-between py-3 text-left"><span className="flex items-center gap-3 text-sm font-semibold text-slate-700"><MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />Scan for devices</span><ChevronRightIcon className="h-4 w-4 text-slate-400" /></button></div></Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Panel><PanelHeader title="Connected devices" subtitle="Most active clients on your network" action={<a href="#/devices" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</a>} /><DeviceTable limit={4} /></Panel>
        <Panel><PanelHeader title="Recent activity" subtitle="Security and network events" /><div className="space-y-5 p-5 sm:p-6">{activity.map((item) => <div key={`${item.title}-${item.time}`} className="flex gap-3"><div className="pt-1.5"><StatusDot tone={item.tone} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p></div><p className="whitespace-nowrap text-xs text-slate-400">{item.time}</p></div>)}</div></Panel>
      </div>
    </div>
  );
}

export function NetworkMapPage() {
  const branches = [{ icon: WifiIcon, title: "5 GHz Wi-Fi", detail: "3 devices", health: "Excellent" }, { icon: SignalIcon, title: "2.4 GHz Wi-Fi", detail: "2 devices", health: "Good" }, { icon: ServerStackIcon, title: "Ethernet LAN", detail: "3 devices", health: "1 Gbps" }];
  return <Panel className="overflow-hidden"><PanelHeader title="Live network topology" subtitle="How your internet, router and devices are connected" /><div className="bg-grid p-5 sm:p-8"><div className="mx-auto max-w-4xl"><div className="mx-auto w-full max-w-xs rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-sm"><GlobeAltIcon className="mx-auto h-8 w-8 text-emerald-600" /><p className="mt-2 font-semibold text-slate-900">Frogfoot fibre</p><p className="mt-1 text-xs text-emerald-700">Online · 100 / 20 Mbps</p></div><div className="mx-auto h-10 w-px bg-blue-300" /><div className="mx-auto w-full max-w-sm rounded-2xl bg-slate-950 p-6 text-center text-white shadow-xl shadow-slate-300"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-600"><ShieldCheckIcon className="h-7 w-7" /></div><p className="mt-3 text-lg font-semibold">SentryOS Router</p><p className="text-xs text-slate-400">Tenda AC10U · 192.168.0.1</p></div><div className="mx-auto h-10 w-px bg-slate-300" /><div className="grid gap-4 md:grid-cols-3">{branches.map(({ icon: Icon, title, detail, health }) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"><Icon className="mx-auto h-7 w-7 text-blue-600" /><p className="mt-3 font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs text-slate-500">{detail}</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><StatusDot />{health}</span></div>)}</div></div></div></Panel>;
}

export function InternetPage({ markChanged }) {
  const [connectionType, setConnectionType] = useState("Automatic IP (DHCP)");
  return <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><Panel><PanelHeader title="Internet connection" subtitle="WAN settings supplied through your Frogfoot fibre connection" /><div className="space-y-5 p-5 sm:p-6"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><CheckCircleIcon className="mt-0.5 h-5 w-5 text-emerald-600" /><div><p className="text-sm font-semibold text-emerald-900">Connected to the internet</p><p className="mt-1 text-xs leading-5 text-emerald-700">WAN address received successfully. No connection faults detected.</p></div></div></div><label className="block"><span className="form-label">Connection type</span><select value={connectionType} onChange={(event) => { setConnectionType(event.target.value); markChanged(); }} className="form-control"><option>Automatic IP (DHCP)</option><option>PPPoE</option><option>Static IP</option></select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="form-label">WAN MAC address</span><input className="form-control font-mono" value="02:5E:4A:10:00:01" readOnly /></label><label className="block"><span className="form-label">MTU</span><input className="form-control" type="number" defaultValue="1500" onChange={markChanged} /></label></div><label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" defaultChecked onChange={markChanged} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span><span className="block text-sm font-semibold text-slate-800">Use automatic DNS</span><span className="block text-xs text-slate-500">Accept DNS servers provided by the connection</span></span></label></div></Panel><Panel><PanelHeader title="WAN details" subtitle="Current lease and gateway" /><dl className="divide-y divide-slate-100 px-5 sm:px-6">{[["Status", "Online"], ["IPv4 address", "203.0.113.27"], ["Default gateway", "203.0.113.1"], ["Primary DNS", "1.1.1.1"], ["Lease remaining", "19h 42m"]].map(([term, value]) => <div key={term} className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-slate-500">{term}</dt><dd className={`text-right text-sm font-semibold ${term.includes("address") || term.includes("gateway") || term.includes("DNS") ? "font-mono text-xs" : ""} ${term === "Status" ? "text-emerald-600" : "text-slate-800"}`}>{value}</dd></div>)}</dl></Panel></div>;
}

function RadioCard({ band, channel, speed, clients, enabled, onChange, markChanged }) {
  return <Panel><div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><WifiIcon className="h-6 w-6" /></div><div><h2 className="font-semibold text-slate-900">{band} network</h2><p className="text-xs text-slate-500">Channel {channel} · up to {speed}</p></div></div><Toggle enabled={enabled} onChange={onChange} label={`Toggle ${band} Wi-Fi`} /></div><div className={`space-y-4 p-5 transition sm:p-6 ${!enabled ? "pointer-events-none opacity-50" : ""}`}><label className="block"><span className="form-label">Network name (SSID)</span><input className="form-control" defaultValue={`SentryOS_${band.replace(" GHz", "G")}`} onChange={markChanged} /></label><label className="block"><span className="form-label">Security</span><select className="form-control" defaultValue="WPA2/WPA3 Personal" onChange={markChanged}><option>WPA2/WPA3 Personal</option><option>WPA2 Personal</option><option>Open network</option></select></label><label className="block"><span className="form-label">Wi-Fi password</span><div className="relative"><input className="form-control pr-12" type="password" defaultValue="sentry-demo-password" onChange={markChanged} /><EyeIcon className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-slate-400" /></div></label><div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">Connected clients</span><span className="font-semibold text-slate-800">{clients}</span></div></div></Panel>;
}

export function WifiPage({ markChanged }) {
  const [radio24, setRadio24] = useState(true); const [radio5, setRadio5] = useState(true);
  const changeRadio = (setter) => (value) => { setter(value); markChanged(); };
  return <div className="space-y-6"><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"><div className="flex gap-3"><InformationCircleIcon className="h-5 w-5 shrink-0" /><p><span className="font-semibold">Smart steering is active.</span> Compatible devices are guided to the best available band.</p></div></div><div className="grid gap-6 xl:grid-cols-2"><RadioCard band="2.4 GHz" channel="6" speed="300 Mbps" clients="3" enabled={radio24} onChange={changeRadio(setRadio24)} markChanged={markChanged} /><RadioCard band="5 GHz" channel="44" speed="867 Mbps" clients="5" enabled={radio5} onChange={changeRadio(setRadio5)} markChanged={markChanged} /></div></div>;
}

export function GuestPage({ guestEnabled, setGuestEnabled, markChanged }) {
  const toggle = (value) => { setGuestEnabled(value); markChanged(); };
  return <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><Panel><PanelHeader title="Guest & IoT network" subtitle="A separate network that keeps visitors away from your private devices" action={<Toggle enabled={guestEnabled} onChange={toggle} label="Toggle guest network" />} /><div className={`space-y-5 p-5 sm:p-6 ${!guestEnabled ? "pointer-events-none opacity-50" : ""}`}><label className="block"><span className="form-label">Network name</span><input className="form-control" defaultValue="SentryOS Guest" onChange={markChanged} /></label><label className="block"><span className="form-label">Guest password</span><input className="form-control" type="password" defaultValue="welcome-home" onChange={markChanged} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="form-label">Session limit</span><select className="form-control" defaultValue="8 hours" onChange={markChanged}><option>2 hours</option><option>8 hours</option><option>24 hours</option><option>No limit</option></select></label><label className="block"><span className="form-label">Speed limit</span><select className="form-control" defaultValue="20 Mbps per device" onChange={markChanged}><option>5 Mbps per device</option><option>20 Mbps per device</option><option>No limit</option></select></label></div><label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" defaultChecked onChange={markChanged} className="h-5 w-5 rounded border-slate-300 text-blue-600" /><span><span className="block text-sm font-semibold text-slate-800">Client isolation</span><span className="block text-xs text-slate-500">Guest devices cannot see each other</span></span></label></div></Panel><Panel><PanelHeader title="Guest access" subtitle="Share without revealing the password" /><div className="p-6 text-center"><div className="mx-auto grid h-44 w-44 grid-cols-7 gap-1 rounded-xl border-8 border-white bg-white p-2 shadow-lg ring-1 ring-slate-200">{Array.from({ length: 49 }, (_, index) => <span key={index} className={`rounded-[1px] ${(index * 7 + index * index + 3) % 5 < 2 ? "bg-slate-950" : "bg-white"}`} />)}</div><p className="mt-5 text-sm font-semibold text-slate-800">Scan to join SentryOS Guest</p><p className="mt-1 text-xs text-slate-500">Prototype QR preview</p></div></Panel></div>;
}

export function LanPage({ markChanged }) {
  return <div className="grid gap-6 xl:grid-cols-2"><Panel><PanelHeader title="Local network" subtitle="Router address and subnet" /><div className="space-y-5 p-5 sm:p-6"><label className="block"><span className="form-label">Router IP address</span><input className="form-control font-mono" defaultValue="192.168.0.1" onChange={markChanged} /></label><label className="block"><span className="form-label">Subnet mask</span><input className="form-control font-mono" defaultValue="255.255.255.0" onChange={markChanged} /></label><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><span className="font-semibold">Take care:</span> changing the router address will disconnect this browser session.</div></div></Panel><Panel><PanelHeader title="DHCP server" subtitle="Automatic addresses for connected devices" /><div className="space-y-5 p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="form-label">Start address</span><input className="form-control font-mono" defaultValue="192.168.0.100" onChange={markChanged} /></label><label className="block"><span className="form-label">End address</span><input className="form-control font-mono" defaultValue="192.168.0.200" onChange={markChanged} /></label></div><label className="block"><span className="form-label">Lease time</span><select className="form-control" defaultValue="24 hours" onChange={markChanged}><option>1 hour</option><option>12 hours</option><option>24 hours</option><option>7 days</option></select></label><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-sm font-semibold text-slate-800">DHCP enabled</p><p className="text-xs text-slate-500">83 addresses available</p></div><StatusDot /></div></div></Panel></div>;
}

export function DevicesPage({ notify, history = false }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => devices.filter((device) => device.name.toLowerCase().includes(query.toLowerCase())), [query]);
  return <Panel><PanelHeader title={history ? "Device history" : "Connected devices"} subtitle={history ? "Clients seen by SentryOS during the last 30 days" : "Inspect, name and control devices currently on your network"} action={<div className="relative"><MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-56 rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" placeholder="Search devices" /></div>} />{query ? <div className="divide-y divide-slate-100">{filtered.map((device) => <button key={device.ip} type="button" onClick={() => notify(`${device.name} details opened`) } className="flex min-h-16 w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 sm:px-6"><span><span className="block text-sm font-semibold text-slate-800">{device.name}</span><span className="font-mono text-xs text-slate-500">{device.ip}</span></span><ChevronRightIcon className="h-4 w-4 text-slate-400" /></button>)}{filtered.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No matching devices</p>}</div> : <DeviceTable />}</Panel>;
}

const protectionCards = [
  { icon: ShieldCheckIcon, title: "Stateful firewall", detail: "Blocks unsolicited inbound traffic", state: "Protected", tone: "green" },
  { icon: NoSymbolIcon, title: "Malicious site blocking", detail: "Uses a local threat list", state: "Enabled", tone: "green" },
  { icon: LockClosedIcon, title: "Administration access", detail: "Restricted to the local network", state: "Local only", tone: "blue" },
  { icon: ExclamationTriangleIcon, title: "UPnP", detail: "Two automatic mappings active", state: "Review", tone: "amber" },
];

export function ProtectionPage({ mode = "firewall", notify, markChanged }) {
  const title = mode === "ports" ? "Port forwarding" : mode === "access" ? "Access control" : "Security centre";
  if (mode === "ports") return <Panel><PanelHeader title={title} subtitle="Publish a local service through a controlled WAN port" action={<PrimaryButton onClick={() => { markChanged(); notify("New forwarding rule draft created"); }}><span className="inline-flex items-center gap-2"><PlusIcon className="h-4 w-4" />Add rule</span></PrimaryButton>} /><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="px-6 py-3">Name</th><th className="px-4 py-3">External</th><th className="px-4 py-3">Internal device</th><th className="px-4 py-3">Protocol</th><th className="px-6 py-3 text-right">Status</th></tr></thead><tbody><tr><td className="px-6 py-5 font-semibold text-slate-800">Home server</td><td className="px-4 py-5 font-mono text-xs">8443</td><td className="px-4 py-5 font-mono text-xs">192.168.0.120:443</td><td className="px-4 py-5">TCP</td><td className="px-6 py-5 text-right text-emerald-600">Enabled</td></tr></tbody></table></div></Panel>;
  if (mode === "access") return <div className="grid gap-6 lg:grid-cols-3"><Panel className="p-6 lg:col-span-2"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><ClockIcon className="h-6 w-6" /></div><div><h2 className="font-semibold text-slate-900">Family schedule</h2><p className="text-sm text-slate-500">Pause selected devices between 22:00 and 06:30</p></div></div><div className="mt-6 grid grid-cols-7 gap-2">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <button key={`${day}-${index}`} type="button" onClick={markChanged} className={`h-11 rounded-xl text-sm font-semibold ${index < 5 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{day}</button>)}</div></Panel><Panel className="p-6"><p className="text-sm font-semibold text-slate-900">Devices covered</p><p className="mt-3 text-4xl font-semibold text-slate-950">3</p><p className="mt-1 text-sm text-slate-500">in the Family group</p><SecondaryButton onClick={() => notify("Device selector opened") } className="mt-6 w-full">Manage group</SecondaryButton></Panel></div>;
  return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{protectionCards.map(({ icon: Icon, title: cardTitle, detail, state, tone }) => <Panel key={cardTitle} className="p-5"><div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-xl ${tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}><Icon className="h-6 w-6" /></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{state}</span></div><h2 className="mt-5 font-semibold text-slate-900">{cardTitle}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{detail}</p></Panel>)}</div><Panel><PanelHeader title={title} subtitle="Last scan completed today at 09:18" action={<PrimaryButton onClick={() => notify("Security scan complete — no immediate threats")}>Scan now</PrimaryButton>} /><div className="p-6"><div className="flex flex-col items-center py-6 text-center"><div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600"><ShieldCheckIcon className="h-10 w-10" /></div><h2 className="mt-5 text-xl font-semibold text-slate-950">No immediate threats detected</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">SentryOS checked exposure, unsafe settings and recent connection attempts.</p></div></div></Panel></div>;
}

export function ServicePage({ type, notify, markChanged }) {
  const config = {
    usb: { icon: CircleStackIcon, title: "USB storage", detail: "Share a connected drive safely across your local network", state: "No drive connected", action: "Check again" },
    vpn: { icon: KeyIcon, title: "VPN server", detail: "Securely connect back to your home network while away", state: "WireGuard ready", action: "Create profile" },
    ddns: { icon: GlobeAltIcon, title: "Dynamic DNS", detail: "Keep a stable hostname when your public address changes", state: "Not configured", action: "Add provider" },
  }[type];
  const Icon = config.icon;
  return <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><Panel><PanelHeader title={config.title} subtitle={config.detail} /><div className="p-6"><div className="flex flex-col items-center py-10 text-center"><div className="grid h-20 w-20 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon className="h-10 w-10" /></div><h2 className="mt-5 text-xl font-semibold text-slate-900">{config.state}</h2><p className="mt-2 max-w-md text-sm text-slate-500">This screen is wired for the future router service API. The current prototype does not change hardware.</p><PrimaryButton onClick={() => { markChanged(); notify(`${config.action} — demo action recorded`); }} className="mt-6">{config.action}</PrimaryButton></div></div></Panel><Panel><PanelHeader title="Privacy by default" subtitle="Local-first service policy" /><div className="space-y-4 p-6">{["No required cloud account", "Administration stays on your LAN", "Secrets are never shown in activity logs"].map((item) => <div key={item} className="flex gap-3 text-sm text-slate-600"><CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" /><span>{item}</span></div>)}</div></Panel></div>;
}

export function SystemPage({ mode = "status", notify, markChanged }) {
  if (mode === "diagnostics") return <div className="grid gap-6 md:grid-cols-3">{[{ title: "Ping test", detail: "Check reachability and response time", icon: SignalIcon }, { title: "Route trace", detail: "Inspect the path to an internet host", icon: ArrowRightIcon }, { title: "DNS lookup", detail: "Confirm a hostname resolves correctly", icon: GlobeAltIcon }].map(({ title, detail, icon: Icon }) => <Panel key={title} className="p-6"><Icon className="h-7 w-7 text-blue-600" /><h2 className="mt-4 font-semibold text-slate-900">{title}</h2><p className="mt-1 min-h-10 text-sm text-slate-500">{detail}</p><SecondaryButton onClick={() => notify(`${title} passed — simulated result`) } className="mt-5 w-full"><span className="inline-flex items-center gap-2"><PlayIcon className="h-4 w-4" />Run test</span></SecondaryButton></Panel>)}</div>;
  if (mode === "logs") return <Panel><PanelHeader title="Events & logs" subtitle="Searchable local audit history" action={<SecondaryButton onClick={() => notify("Log export prepared")}>Export log</SecondaryButton>} /><div className="divide-y divide-slate-100">{activity.concat([{ title: "System startup", detail: "All services loaded successfully", time: "14 days ago", tone: "blue" }]).map((event, index) => <div key={`${event.title}-${index}`} className="grid gap-2 px-5 py-4 sm:grid-cols-[150px_1fr_auto] sm:px-6"><span className="font-mono text-xs text-slate-400">{event.time}</span><span className="text-sm font-semibold text-slate-800">{event.title}<span className="ml-2 font-normal text-slate-500">{event.detail}</span></span><span className="text-xs uppercase tracking-wide text-slate-400">Info</span></div>)}</div></Panel>;
  if (mode === "firmware") return <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><Panel><PanelHeader title="Firmware update" subtitle="Install a verified SentryOS image on supported hardware" /><div className="p-6"><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" /><p className="text-sm leading-6 text-amber-800"><span className="font-semibold">Prototype only.</span> Firmware flashing remains disabled until the exact AC10U hardware revision, recovery path and image format are verified.</p></div></div><div className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 p-5"><div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-600"><CloudArrowDownIcon className="h-6 w-6" /></div><div className="flex-1"><p className="font-semibold text-slate-900">SentryOS interface prototype</p><p className="text-xs text-slate-500">Dashboard build · no flashable image</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Preview</span></div><PrimaryButton disabled className="mt-6 w-full">Install update</PrimaryButton></div></Panel><Panel><PanelHeader title="Safety gates" subtitle="Required before flashing is unlocked" /><div className="space-y-4 p-6">{["Confirm hardware revision and SoC", "Back up stock firmware", "Verify serial recovery access", "Build and validate a signed image"].map((item, index) => <div key={item} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{index + 1}</span><p className="text-sm text-slate-600">{item}</p></div>)}</div></Panel></div>;
  if (mode === "backup") return <div className="grid gap-6 md:grid-cols-2"><Panel className="p-6"><CloudArrowDownIcon className="h-8 w-8 text-blue-600" /><h2 className="mt-5 text-lg font-semibold text-slate-900">Back up settings</h2><p className="mt-2 text-sm leading-6 text-slate-500">Download an encrypted copy of the router configuration.</p><PrimaryButton onClick={() => notify("Demo backup created") } className="mt-6">Create backup</PrimaryButton></Panel><Panel className="p-6"><ArrowPathIcon className="h-8 w-8 text-violet-600" /><h2 className="mt-5 text-lg font-semibold text-slate-900">Restore settings</h2><p className="mt-2 text-sm leading-6 text-slate-500">Restore a compatible configuration after checking its signature.</p><SecondaryButton onClick={() => notify("Restore file picker opened") } className="mt-6">Choose backup</SecondaryButton></Panel></div>;
  return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="CPU load" value="18%" detail="Normal operating range" icon={CpuChipIcon} tone="blue" /><MetricCard label="Memory" value="41%" detail="29 MB available" icon={ServerStackIcon} tone="violet" /><MetricCard label="Temperature" value="52°C" detail="Within expected range" icon={BoltIcon} tone="amber" /><MetricCard label="Uptime" value="14 days" detail="Last restart 12 Aug" icon={ClockIcon} tone="green" /></div><Panel><PanelHeader title="Router information" subtitle="Hardware and software identity" /><dl className="grid sm:grid-cols-2 xl:grid-cols-3">{[["Product", "Tenda AC10U AC1200"], ["SentryOS version", "0.1.0 interface prototype"], ["Hardware revision", "Awaiting confirmation"], ["Router address", "192.168.0.1"], ["WAN MAC", "02:5E:4A:10:00:01"], ["Time zone", "Africa/Johannesburg"]].map(([term, value]) => <div key={term} className="border-b border-slate-100 p-5 xl:[&:nth-last-child(-n+3)]:border-b-0"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{term}</dt><dd className="mt-2 text-sm font-semibold text-slate-800">{value}</dd></div>)}</dl></Panel><Panel className="p-6"><div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900">Restart router</h2><p className="mt-1 text-sm text-slate-500">Connected devices will briefly lose internet access.</p></div><button type="button" onClick={() => { markChanged(); notify("Restart requires confirmation in production") }} className="min-h-11 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100">Restart safely</button></div></Panel></div>;
}
