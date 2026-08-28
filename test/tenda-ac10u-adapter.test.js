import test from "node:test";
import assert from "node:assert/strict";
import { TendaAc10uAdapter, __test__ } from "../server/tenda-ac10u-adapter.mjs";

test("the adapter creates the same MD5 value used by the stock local login page", () => {
  assert.equal(__test__.md5("abc"), "900150983cd24fb0d6963f7d28e17f72");
});

test("the adapter exposes a sanitised read-only snapshot", async () => {
  const requests = [];
  const adapter = new TendaAc10uAdapter({
    username: "admin",
    password: "secret",
    fetchImpl: async (url, options) => {
      requests.push({ url: String(url), options });
      if (url.pathname === "/login/Auth") return new Response("0", { headers: { "set-cookie": "session=abc; Path=/" } });
      return Response.json({
        adv_run_time: "90061",
        adv_hard_ver: "V1.0",
        adv_firm_ver: "V15.03.06.49_multi",
        wifi_enable: "1",
        wifi_enable_5g: "1",
        adv_wrl_channel: "6",
        adv_wrl_channel_5g: "44",
        wanInfo: [{ adv_connect_type: "2", adv_connect_status: "3", adv_ip: "203.0.113.5", adv_mac: "00:11:22:33:44:55" }],
      });
    },
  });

  const snapshot = await adapter.snapshot();
  assert.equal(snapshot.wan.protocol, "PPPoE");
  assert.equal(snapshot.wan.status, "online");
  assert.equal(snapshot.router.firmwareVersion, "V15.03.06.49_multi");
  assert.equal(snapshot.radios[1].channel, 44);
  assert.equal(snapshot.health.uptime, "1d 1h 1m");
  assert.equal(JSON.stringify(snapshot).includes("203.0.113.5"), false);
  assert.equal(JSON.stringify(snapshot).includes("00:11:22:33:44:55"), false);
  assert.equal(requests.length, 2);
  assert.match(String(requests[1].options.headers.get("cookie")), /session=abc/);
});

test("the adapter refuses any diagnostic outside the read-only allowlist", async () => {
  const adapter = new TendaAc10uAdapter({ username: "admin", password: "secret" });
  await assert.rejects(() => adapter.runDiagnostic("set_wifi_channel"), /read-only bridge allowlist/);
});
