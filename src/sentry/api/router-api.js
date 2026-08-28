const MOCK_DELAY_MS = 360;

const wait = (duration = MOCK_DELAY_MS) => new Promise((resolve) => globalThis.setTimeout(resolve, duration));

const mockSnapshot = Object.freeze({
  capturedAt: "2026-08-26T12:00:00.000Z",
  mode: "simulation",
  wan: { status: "online", provider: "Frogfoot", protocol: "DHCP/IPoE", latencyMs: 8 },
  radios: [
    { band: "2.4 GHz", channel: 6, widthMhz: 20, utilisation: 78, clients: 3 },
    { band: "5 GHz", channel: 44, widthMhz: 80, utilisation: 31, clients: 4 },
  ],
  clients: { online: 8, wired: 1, wireless: 7 },
  health: { score: 86, uptime: "12d 7h 41m", cpu: 18, memory: 46 },
});

const mockReports = [
  { id: "weekly-34", title: "Weekly network health", type: "Health", createdAt: "Today, 08:00", score: 86, status: "Ready" },
  { id: "security-25", title: "Security posture", type: "Security", createdAt: "Yesterday, 21:15", score: 94, status: "Ready" },
  { id: "radio-21", title: "Wi-Fi interference review", type: "Wireless", createdAt: "25 Aug, 18:40", score: 72, status: "Review" },
];

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`SentryOS API request failed (${response.status})`);
  return response.json();
}

export function createRouterApi(options = {}) {
  const mode = options.mode ?? import.meta.env?.VITE_SENTRY_API_MODE ?? "mock";
  const baseUrl = options.baseUrl ?? import.meta.env?.VITE_SENTRY_API_BASE ?? "/api/v1";

  if (mode !== "mock") {
    return {
      mode,
      getSnapshot: () => request(baseUrl, "/snapshot"),
      runDiagnostic: (diagnostic) => request(baseUrl, "/diagnostics", { method: "POST", body: JSON.stringify({ diagnostic }) }),
      getReports: () => request(baseUrl, "/reports"),
      generateReport: (type) => request(baseUrl, "/reports", { method: "POST", body: JSON.stringify({ type }) }),
    };
  }

  return {
    mode: "mock",
    async getSnapshot() { await wait(120); return structuredClone(mockSnapshot); },
    async runDiagnostic(diagnostic) { await wait(); return { diagnostic, status: "complete", result: "Mock diagnostic completed safely" }; },
    async getReports() { await wait(120); return structuredClone(mockReports); },
    async generateReport(type) {
      await wait();
      return { id: `draft-${Date.now()}`, title: `${type} report`, type, createdAt: "Just now", score: 86, status: "Ready" };
    },
  };
}

export const routerApi = createRouterApi();
