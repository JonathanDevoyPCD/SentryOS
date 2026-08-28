import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  InformationCircleIcon,
  MapPinIcon,
  PlusIcon,
  SignalIcon,
  TrashIcon,
  TvIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";

const STORAGE_KEY = "sentryos-home-map-v1";

const starterRooms = [
  { id: "living", name: "Living room", kind: "Social", x: 4, y: 6, width: 42, height: 39 },
  { id: "kitchen", name: "Kitchen", kind: "Utility", x: 48, y: 6, width: 27, height: 39 },
  { id: "study", name: "Study", kind: "Work", x: 77, y: 6, width: 19, height: 39 },
  { id: "hall", name: "Hall", kind: "Connector", x: 4, y: 48, width: 21, height: 44 },
  { id: "bedroom", name: "Main bedroom", kind: "Private", x: 27, y: 48, width: 39, height: 44 },
  { id: "guest", name: "Guest room", kind: "Private", x: 68, y: 48, width: 28, height: 44 },
];

const starterPins = [
  { id: "router", name: "SentryOS router", type: "Router", x: 27, y: 31, quality: 100, icon: "wifi" },
  { id: "tv", name: "Living room TV", type: "Ethernet", x: 14, y: 23, quality: 100, icon: "tv" },
  { id: "laptop", name: "Work laptop", type: "5 GHz", x: 85, y: 29, quality: 84, icon: "phone" },
  { id: "phone", name: "Phone", type: "5 GHz", x: 44, y: 70, quality: 72, icon: "phone" },
  { id: "printer", name: "Printer", type: "2.4 GHz", x: 86, y: 70, quality: 58, icon: "chip" },
];

const pinIcons = { wifi: WifiIcon, tv: TvIcon, phone: DevicePhoneMobileIcon, chip: CpuChipIcon };

function iconForPin(pin) {
  if (typeof pin.icon === "string" && pinIcons[pin.icon]) return pin.icon;
  return starterPins.find((starter) => starter.id === pin.id)?.icon ?? "phone";
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function qualityTone(quality) {
  if (quality >= 80) return { dot: "bg-emerald-500", text: "text-emerald-700", label: "Strong" };
  if (quality >= 60) return { dot: "bg-amber-500", text: "text-amber-700", label: "Fair" };
  return { dot: "bg-rose-500", text: "text-rose-700", label: "Weak" };
}

function readSavedMap() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { rooms: starterRooms, pins: starterPins };
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed.rooms) && Array.isArray(parsed.pins) ? { rooms: parsed.rooms, pins: parsed.pins.map((pin) => ({ ...pin, icon: iconForPin(pin) })) } : { rooms: starterRooms, pins: starterPins };
  } catch {
    return { rooms: starterRooms, pins: starterPins };
  }
}

function IconButton({ label, children, onClick, active = false }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`grid h-11 w-11 place-items-center rounded-xl border transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>{children}</button>;
}

export default function HomeMapPage({ notify }) {
  const [map, setMap] = useState(readSavedMap);
  const [selectedId, setSelectedId] = useState("living");
  const [walkTestOpen, setWalkTestOpen] = useState(false);
  const boardRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }, [map]);

  const selectedRoom = map.rooms.find((room) => room.id === selectedId) ?? map.rooms[0] ?? null;
  const router = map.pins.find((pin) => pin.id === "router") ?? map.pins[0];
  const coverageStyle = useMemo(() => ({
    backgroundImage: `radial-gradient(circle at ${router?.x ?? 50}% ${router?.y ?? 50}%, rgba(16, 185, 129, .30) 0, rgba(16, 185, 129, .15) 17%, rgba(250, 204, 21, .12) 35%, rgba(251, 146, 60, .05) 50%, transparent 68%)`,
  }), [router]);

  const updateRoom = (id, patch) => setMap((current) => ({ ...current, rooms: current.rooms.map((room) => room.id === id ? { ...room, ...patch } : room) }));
  const updatePin = (id, patch) => setMap((current) => ({ ...current, pins: current.pins.map((pin) => pin.id === id ? { ...pin, ...patch } : pin) }));

  const beginDrag = (event, type, item) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { type, id: item.id, startX: event.clientX, startY: event.clientY, x: item.x, y: item.y, width: item.width ?? 0, height: item.height ?? 0 };
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    const bounds = boardRef.current?.getBoundingClientRect();
    if (!drag || !bounds) return;
    const x = drag.x + ((event.clientX - drag.startX) / bounds.width) * 100;
    const y = drag.y + ((event.clientY - drag.startY) / bounds.height) * 100;
    if (drag.type === "room") updateRoom(drag.id, { x: clamp(x, 0, 100 - drag.width), y: clamp(y, 0, 100 - drag.height) });
    else updatePin(drag.id, { x: clamp(x, 3, 97), y: clamp(y, 4, 96) });
  };

  const addRoom = () => {
    const id = `room-${Date.now()}`;
    setMap((current) => ({ ...current, rooms: [...current.rooms, { id, name: "New room", kind: "Custom", x: 38, y: 38, width: 25, height: 25 }] }));
    setSelectedId(id);
    notify("New room module added. Drag it into position.");
  };

  const resetMap = () => {
    setMap({ rooms: starterRooms, pins: starterPins });
    setSelectedId("living");
    notify("Generic floor plan restored.");
  };

  const deleteSelectedRoom = () => {
    if (!selectedRoom || map.rooms.length === 1) return;
    setMap((current) => ({ ...current, rooms: current.rooms.filter((room) => room.id !== selectedRoom.id) }));
    setSelectedId(map.rooms.find((room) => room.id !== selectedRoom.id)?.id ?? "");
    notify("Room module removed from this local map.");
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><HomeIcon className="h-4 w-4" />Editable local floor plan</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Home coverage map</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Build a rough plan first, then use a guided walk test to replace the estimated coverage with measured signal readings.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <IconButton label="Add room" onClick={addRoom}><PlusIcon className="h-5 w-5" /></IconButton>
          <IconButton label="Restore generic plan" onClick={resetMap}><ArrowPathIcon className="h-5 w-5" /></IconButton>
          <button type="button" onClick={() => setWalkTestOpen((open) => !open)} className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${walkTestOpen ? "bg-blue-700 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}><span className="inline-flex items-center gap-2"><SignalIcon className="h-5 w-5" />{walkTestOpen ? "Walk test guide open" : "Start walk test"}</span></button>
        </div>
      </section>

      {walkTestOpen && <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950 sm:p-6"><div className="flex gap-3"><InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><p className="font-semibold">Walk-test workflow is ready for the local bridge.</p><p className="mt-1 leading-6 text-blue-800">When the router is connected, SentryOS will ask you to stand in selected rooms with a phone, capture the local Wi-Fi signal, and paint real readings onto this plan. Today’s colour layer is an estimate only and does not claim to know your home’s walls or device positions.</p></div></div></section>}

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="font-semibold text-slate-900">Generic plan</h3><p className="mt-1 text-sm text-slate-500">Drag room modules and device pins to match your home.</p></div><div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"><span className="h-2 w-2 rounded-full bg-amber-500" />Estimated coverage</div></div>
          <div className="p-3 sm:p-5">
            <div ref={boardRef} onPointerMove={moveDrag} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} className="relative min-h-[540px] touch-none overflow-hidden rounded-xl border border-slate-300 bg-slate-100 p-2 sm:p-3" aria-label="Editable home floor plan">
              <div className="pointer-events-none absolute inset-0 opacity-90" style={coverageStyle} />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.16)_1px,transparent_1px)] bg-[size:32px_32px]" />
              {map.rooms.map((room) => <button key={room.id} type="button" onClick={() => setSelectedId(room.id)} onPointerDown={(event) => beginDrag(event, "room", room)} style={{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.width}%`, height: `${room.height}%` }} className={`absolute flex min-w-[84px] touch-none select-none flex-col justify-between border-2 p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-200 ${selectedRoom?.id === room.id ? "z-10 border-blue-500 bg-white/90 shadow-lg" : "border-slate-300 bg-white/75 hover:border-blue-300"}`}><span className="line-clamp-2 text-sm font-semibold text-slate-800">{room.name}</span><span className="mt-2 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400">{room.kind}</span><ArrowsPointingOutIcon className="absolute bottom-2 right-2 h-3.5 w-3.5 text-slate-300" /></button>)}
              {map.pins.map((pin) => {
                const tone = qualityTone(pin.quality);
                const PinIcon = pinIcons[pin.icon] ?? DevicePhoneMobileIcon;
                return <button key={pin.id} type="button" onPointerDown={(event) => beginDrag(event, "pin", pin)} title={`${pin.name}: ${pin.quality}% estimated quality`} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 touch-none select-none text-center focus:outline-none focus:ring-4 focus:ring-blue-200"><span className={`relative mx-auto grid h-10 w-10 place-items-center rounded-full border-4 border-white text-white shadow-lg ${pin.id === "router" ? "bg-blue-600" : tone.dot}`}><PinIcon className="h-5 w-5" />{pin.id === "router" && <span className="absolute -inset-2 rounded-full border border-blue-400/70" />}</span><span className="mt-1 block max-w-[94px] truncate rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">{pin.name}</span></button>;
              })}
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm"><span className="font-semibold text-slate-800">Tip:</span> Select a room to edit it. Drag the small room and device markers directly.</div>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-panel"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-semibold text-slate-900">Room inspector</h3><p className="mt-1 text-sm text-slate-500">Each room is an independent module.</p></div>{selectedRoom ? <div className="space-y-5 p-5"><label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.13em] text-slate-500">Room name</span><input className="form-control" value={selectedRoom.name} onChange={(event) => updateRoom(selectedRoom.id, { name: event.target.value })} /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-[.13em] text-slate-500">Room type</span><select className="form-control" value={selectedRoom.kind} onChange={(event) => updateRoom(selectedRoom.id, { kind: event.target.value })}><option>Social</option><option>Private</option><option>Work</option><option>Utility</option><option>Connector</option><option>Custom</option></select></label><label className="block"><span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[.13em] text-slate-500">Width <span>{Math.round(selectedRoom.width)}%</span></span><input className="mt-2 w-full accent-blue-600" type="range" min="16" max="68" value={selectedRoom.width} onChange={(event) => updateRoom(selectedRoom.id, { width: Number(event.target.value), x: Math.min(selectedRoom.x, 100 - Number(event.target.value)) })} /></label><label className="block"><span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[.13em] text-slate-500">Depth <span>{Math.round(selectedRoom.height)}%</span></span><input className="mt-2 w-full accent-blue-600" type="range" min="16" max="68" value={selectedRoom.height} onChange={(event) => updateRoom(selectedRoom.id, { height: Number(event.target.value), y: Math.min(selectedRoom.y, 100 - Number(event.target.value)) })} /></label><button type="button" onClick={deleteSelectedRoom} disabled={map.rooms.length === 1} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"><TrashIcon className="h-4 w-4" />Remove room</button></div> : <p className="p-5 text-sm text-slate-500">Select a room on the plan to edit it.</p>}</section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><WifiIcon className="h-5 w-5" /></span><div><h3 className="font-semibold text-slate-900">Coverage legend</h3><p className="text-sm text-slate-500">Current device quality estimate</p></div></div><div className="mt-5 space-y-3">{[["Strong", "bg-emerald-500", "80–100%"], ["Fair", "bg-amber-500", "60–79%"], ["Weak", "bg-rose-500", "Below 60%"]].map(([label, color, range]) => <div key={label} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-700"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span><span className="font-mono text-xs text-slate-400">{range}</span></div>)}</div><div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><CheckCircleIcon className="mr-1 inline h-4 w-4 text-emerald-600" />Map structure is saved only in this browser. Signal colours become trustworthy after a walk test.</div></section>
        </aside>
      </div>
    </div>
  );
}
