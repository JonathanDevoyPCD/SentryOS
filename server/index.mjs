import http from "node:http";
import { TendaAc10uAdapter } from "./tenda-ac10u-adapter.mjs";

const port = Number(process.env.SENTRY_BRIDGE_PORT ?? 8787);
const adapter = new TendaAc10uAdapter({
  routerUrl: process.env.SENTRY_ROUTER_URL ?? "http://192.168.0.1",
  username: process.env.SENTRY_ROUTER_USERNAME,
  password: process.env.SENTRY_ROUTER_PASSWORD,
});
const reports = [];

function json(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/api/v1/bridge/status") {
      return json(response, 200, { mode: "tenda-ac10u-read-only", configured: adapter.isConfigured(), routerReachable: null, mutationSupport: false });
    }
    if (request.method === "GET" && url.pathname === "/api/v1/snapshot") return json(response, 200, await adapter.snapshot());
    if (request.method === "POST" && url.pathname === "/api/v1/diagnostics") {
      const { diagnostic } = await readJson(request);
      return json(response, 200, await adapter.runDiagnostic(diagnostic));
    }
    return json(response, 404, { error: "SentryOS bridge route not found." });
  } catch (error) {
    const status = /required|allowlist|JSON/.test(error.message) ? 400 : 502;
    return json(response, status, { error: error.message, mode: "tenda-ac10u-read-only" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`SentryOS read-only bridge listening at http://127.0.0.1:${port}`);
});
