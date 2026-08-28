import { validateActionPlan } from "./policy.js";

const wait = (duration = 650) => new Promise((resolve) => globalThis.setTimeout(resolve, duration));

const responseFor = (prompt) => {
  const query = prompt.toLowerCase();

  if (/interference|channel|wifi|wi-fi/.test(query)) {
    return {
      summary: "The simulated 2.4 GHz radio is busy while 5 GHz has healthy capacity. A channel scan is safe; changing channel should only be staged after the scan confirms a cleaner option.",
      findings: [
        { label: "2.4 GHz utilisation", value: "78%", tone: "warning" },
        { label: "5 GHz utilisation", value: "31%", tone: "good" },
        { label: "Likely issue", value: "Neighbouring radios", tone: "neutral" },
      ],
      actions: [
        { id: "run_channel_scan", reason: "Measure nearby radio use before changing configuration." },
        { id: "set_wifi_channel", parameters: { band: "2.4 GHz", channel: "best-from-scan" }, reason: "Move away from the busiest overlapping channel." },
        { id: "set_channel_width", parameters: { band: "2.4 GHz", widthMhz: 20 }, reason: "Prefer stability in a congested 2.4 GHz environment." },
      ],
    };
  }

  if (/slow|boost|speed|connection|call|priority/.test(query)) {
    return {
      summary: "WAN latency looks healthy in the simulated snapshot. I would measure throughput and DNS first, then temporarily prioritise the work device only if local traffic is competing with the call.",
      findings: [
        { label: "WAN latency", value: "8 ms", tone: "good" },
        { label: "Online devices", value: "8", tone: "neutral" },
        { label: "Peak local load", value: "Moderate", tone: "neutral" },
      ],
      actions: [
        { id: "run_speed_test", reason: "Separate WAN performance from local Wi-Fi conditions." },
        { id: "run_dns_test", reason: "Check whether slow name resolution is affecting browsing." },
        { id: "set_device_priority", parameters: { device: "Jonathan's Laptop", durationMinutes: 60 }, reason: "Protect a work call from competing local traffic." },
      ],
    };
  }

  if (/security|firewall|threat|safe/.test(query)) {
    return {
      summary: "The mock security posture is healthy. I can generate a report from local firewall, access-control and administration events without changing protection settings.",
      findings: [
        { label: "Firewall", value: "Enabled", tone: "good" },
        { label: "Remote admin", value: "Disabled", tone: "good" },
        { label: "Immediate threats", value: "None detected", tone: "good" },
      ],
      actions: [{ id: "generate_health_report", reason: "Create an auditable summary of the current security posture." }],
    };
  }

  return {
    summary: "The simulated router is online with a health score of 86. The main item worth investigating is high 2.4 GHz utilisation; no configuration change is necessary before running safe checks.",
    findings: [
      { label: "Overall health", value: "86 / 100", tone: "good" },
      { label: "Internet", value: "Online", tone: "good" },
      { label: "Watch item", value: "2.4 GHz load", tone: "warning" },
    ],
    actions: [
      { id: "run_channel_scan", reason: "Confirm whether neighbouring networks are causing congestion." },
      { id: "generate_health_report", reason: "Record the current baseline for future comparison." },
    ],
  };
};

async function postAnalysis(baseUrl, prompt, snapshot) {
  const response = await fetch(`${baseUrl}/ai/analyze`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, snapshot }),
  });
  if (!response.ok) throw new Error(`SentryAI request failed (${response.status})`);
  return response.json();
}

export function createSentryAiClient(options = {}) {
  const mode = options.mode ?? import.meta.env?.VITE_SENTRY_API_MODE ?? "mock";
  const baseUrl = options.baseUrl ?? import.meta.env?.VITE_SENTRY_API_BASE ?? "/api/v1";

  return {
    mode,
    async analyze(prompt, snapshot) {
      const raw = mode === "mock" ? (await wait(), responseFor(prompt)) : await postAnalysis(baseUrl, prompt, snapshot);
      const plan = validateActionPlan(raw.actions);
      return { ...raw, ...plan, id: `analysis-${Date.now()}`, createdAt: new Date().toISOString(), mode };
    },
  };
}

export const sentryAiClient = createSentryAiClient();
