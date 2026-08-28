import { createHash } from "node:crypto";

const CONNECT_TYPES = ["DHCP/IPoE", "Static IP", "PPPoE", "Russia PPTP", "Russia L2TP", "Russia PPPoE"];
const CONNECT_STATES = ["cable-disconnected", "disconnected", "connecting", "online"];
const READ_ONLY_DIAGNOSTICS = new Set([
  "run_channel_scan",
  "run_speed_test",
  "run_dns_test",
  "generate_health_report",
]);

function md5(value) {
  return createHash("md5").update(value, "utf8").digest("hex");
}

function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function cookiesFromHeaders(headers) {
  const raw = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : asArray(headers.get("set-cookie"));
  return raw.map((item) => item.split(";", 1)[0]).filter(Boolean).join("; ");
}

function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatUptime(seconds) {
  const value = toInteger(seconds);
  if (value === null || value < 0) return null;
  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function radioFromStatus(data, suffix, band) {
  const enabled = Number(data[`wifi_enable${suffix}`]) !== 0;
  return {
    band,
    enabled,
    channel: toInteger(data[`adv_wrl_channel${suffix}`]),
    widthMhz: null,
    utilisation: null,
    clients: null,
  };
}

function normaliseSystemStatus(data) {
  const wan = asArray(data.wanInfo)[0] ?? {};
  const connectType = toInteger(wan.adv_connect_type);
  const connectStatus = toInteger(wan.adv_connect_status);

  return {
    capturedAt: new Date().toISOString(),
    mode: "tenda-ac10u-read-only",
    source: "goform/GetSystemStatus",
    wan: {
      status: CONNECT_STATES[connectStatus] ?? "unknown",
      protocol: CONNECT_TYPES[connectType] ?? "Unknown",
      latencyMs: null,
    },
    radios: [radioFromStatus(data, "", "2.4 GHz"), radioFromStatus(data, "_5g", "5 GHz")],
    clients: { online: null, wired: null, wireless: null },
    health: {
      score: null,
      uptime: formatUptime(data.adv_run_time),
      cpu: null,
      memory: null,
    },
    router: {
      hardwareVersion: data.adv_hard_ver ?? null,
      firmwareVersion: data.adv_firm_ver ?? null,
    },
  };
}

export class TendaAc10uAdapter {
  constructor({ routerUrl = "http://192.168.0.1", username, password, fetchImpl = globalThis.fetch, timeoutMs = 5000 } = {}) {
    this.routerUrl = new URL(routerUrl);
    if (this.routerUrl.protocol !== "http:") throw new Error("The AC10U stock interface is expected to use local HTTP.");
    this.username = username;
    this.password = password;
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.cookie = "";
  }

  isConfigured() {
    return Boolean(this.username && this.password);
  }

  async request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = new Headers(options.headers);
      if (this.cookie) headers.set("cookie", this.cookie);
      const response = await this.fetch(new URL(path, this.routerUrl), { ...options, headers, signal: controller.signal });
      const newCookies = cookiesFromHeaders(response.headers);
      if (newCookies) this.cookie = newCookies;
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  async login() {
    if (!this.isConfigured()) throw new Error("Router username and password are required by the local bridge.");
    const form = new URLSearchParams({ username: this.username, password: md5(this.password) });
    const response = await this.request("/login/Auth", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const result = (await response.text()).trim();
    if (!response.ok || result === "1") {
      this.cookie = "";
      throw new Error("The router did not accept the local bridge login.");
    }
  }

  async getSystemStatus({ retry = true } = {}) {
    if (!this.cookie) await this.login();
    const response = await this.request(`/goform/GetSystemStatus?_=${Date.now()}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("json")) {
      if (retry) {
        this.cookie = "";
        return this.getSystemStatus({ retry: false });
      }
      throw new Error("The router status request was rejected or did not return JSON.");
    }
    return response.json();
  }

  async snapshot() {
    return normaliseSystemStatus(await this.getSystemStatus());
  }

  async runDiagnostic(diagnostic) {
    if (!READ_ONLY_DIAGNOSTICS.has(diagnostic)) throw new Error("Diagnostic is not in the read-only bridge allowlist.");
    const snapshot = await this.snapshot();
    return {
      diagnostic,
      status: "complete",
      mode: "tenda-ac10u-read-only",
      result: "Read-only status snapshot captured. No router setting was changed.",
      snapshot,
    };
  }
}

export const __test__ = { formatUptime, md5, normaliseSystemStatus };
