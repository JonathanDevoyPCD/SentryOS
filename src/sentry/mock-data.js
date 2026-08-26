import {
  AdjustmentsHorizontalIcon,
  ArrowPathRoundedSquareIcon,
  BoltIcon,
  CircleStackIcon,
  CommandLineIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  HomeIcon,
  KeyIcon,
  LockClosedIcon,
  MapIcon,
  QueueListIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  SignalIcon,
  Squares2X2Icon,
  UsersIcon,
  WifiIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export const navigation = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: HomeIcon },
      { label: "Network map", path: "/network-map", icon: MapIcon },
    ],
  },
  {
    label: "Connections",
    items: [
      { label: "Internet", path: "/internet", icon: GlobeAltIcon },
      { label: "Wi-Fi", path: "/wifi", icon: WifiIcon },
      { label: "Guest & IoT", path: "/guest", icon: Squares2X2Icon },
      { label: "LAN & DHCP", path: "/lan", icon: ServerStackIcon },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "Connected devices", path: "/devices", icon: UsersIcon, badge: "8" },
      { label: "Device history", path: "/history", icon: QueueListIcon },
    ],
  },
  {
    label: "Protection",
    items: [
      { label: "Firewall", path: "/firewall", icon: ShieldCheckIcon },
      { label: "Access control", path: "/access-control", icon: LockClosedIcon },
      { label: "Port forwarding", path: "/port-forwarding", icon: ArrowPathRoundedSquareIcon },
    ],
  },
  {
    label: "Services",
    items: [
      { label: "USB storage", path: "/usb", icon: CircleStackIcon },
      { label: "VPN", path: "/vpn", icon: KeyIcon },
      { label: "Dynamic DNS", path: "/ddns", icon: BoltIcon },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Router status", path: "/system", icon: CpuChipIcon },
      { label: "Diagnostics", path: "/diagnostics", icon: WrenchScrewdriverIcon },
      { label: "Events & logs", path: "/logs", icon: CommandLineIcon },
      { label: "Backup & restore", path: "/backup", icon: AdjustmentsHorizontalIcon },
      { label: "Firmware update", path: "/firmware", icon: DevicePhoneMobileIcon },
    ],
  },
];

export const devices = [
  { name: "Jonathan's Laptop", type: "Laptop", connection: "5 GHz", ip: "192.168.0.104", speed: "412 Mbps", traffic: "8.4 GB", signal: 92, status: "Online" },
  { name: "Living Room TV", type: "Smart TV", connection: "LAN 1", ip: "192.168.0.108", speed: "1 Gbps", traffic: "21.7 GB", signal: 100, status: "Online" },
  { name: "Pixel 9", type: "Phone", connection: "5 GHz", ip: "192.168.0.111", speed: "288 Mbps", traffic: "3.1 GB", signal: 78, status: "Online" },
  { name: "Office Printer", type: "Printer", connection: "2.4 GHz", ip: "192.168.0.115", speed: "54 Mbps", traffic: "142 MB", signal: 64, status: "Online" },
  { name: "Kitchen Speaker", type: "IoT", connection: "2.4 GHz", ip: "192.168.0.119", speed: "32 Mbps", traffic: "86 MB", signal: 71, status: "Online" },
];

export const activity = [
  { title: "New device joined 5 GHz", detail: "Pixel 9 · 192.168.0.111", time: "2 min ago", tone: "blue" },
  { title: "Security scan completed", detail: "No immediate threats detected", time: "18 min ago", tone: "green" },
  { title: "WAN lease renewed", detail: "Frogfoot · DHCP/IPoE", time: "1 hr ago", tone: "green" },
  { title: "Admin sign-in", detail: "Local network · 192.168.0.104", time: "Today, 08:42", tone: "amber" },
];

export const trafficSeries = [
  { name: "Download", data: [18, 24, 21, 42, 36, 58, 49, 65, 54, 73, 68, 82] },
  { name: "Upload", data: [4, 6, 5, 8, 11, 9, 14, 12, 16, 13, 18, 15] },
];

export const trafficOptions = {
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "Source Sans 3, sans-serif" },
  colors: ["#2563eb", "#7dd3fc"],
  dataLabels: { enabled: false },
  grid: { borderColor: "#e2e8f0", strokeDashArray: 4, padding: { left: 4, right: 10 } },
  legend: { position: "top", horizontalAlign: "right", fontSize: "12px", markers: { radius: 12 } },
  stroke: { curve: "smooth", width: [3, 2] },
  tooltip: { theme: "light", y: { formatter: (value) => `${value} Mbps` } },
  xaxis: {
    categories: ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"],
    axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
  },
  yaxis: { labels: { formatter: (value) => `${value}`, style: { colors: "#94a3b8", fontSize: "11px" } } },
};

export const pageTitles = Object.fromEntries(
  navigation.flatMap((group) => group.items.map((item) => [item.path, item.label])),
);
