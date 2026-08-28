import test from "node:test";
import assert from "node:assert/strict";
import { ACTION_RISK, assertActionPlanSafe, classifyAction, validateActionPlan } from "../src/sentry/ai/policy.js";
import { createSentryAiClient } from "../src/sentry/ai/sentry-ai-client.js";

test("read-only diagnostics are classified as observe actions", () => {
  assert.equal(classifyAction({ id: "run_channel_scan" }).risk, ACTION_RISK.OBSERVE);
});

test("network changes always require confirmation", () => {
  const plan = validateActionPlan([{ id: "set_wifi_channel", parameters: { channel: 1 } }]);
  assert.equal(plan.canStage, true);
  assert.equal(plan.requiresConfirmation, true);
});

test("firmware and bootloader actions are blocked", () => {
  const plan = validateActionPlan([{ id: "flash_firmware" }, { id: "write_bootloader" }]);
  assert.equal(plan.canStage, false);
  assert.equal(plan.blocked.length, 2);
});

test("unknown AI actions fail closed", () => {
  const action = classifyAction({ id: "make_router_faster_somehow" });
  assert.equal(action.risk, ACTION_RISK.BLOCKED);
  assert.match(action.impact, /not in the SentryOS allowlist/i);
});

test("unsafe mixed action plans are rejected", () => {
  assert.throws(
    () => assertActionPlanSafe([{ id: "run_dns_test" }, { id: "disable_firewall" }]),
    /SentryOS blocked: Disable firewall/,
  );
});

test("mock interference analysis returns only policy-classified actions", async () => {
  const client = createSentryAiClient({ mode: "mock" });
  const result = await client.analyze("Check Wi-Fi interference", {});
  assert.equal(result.canStage, true);
  assert.ok(result.actions.some((action) => action.id === "run_channel_scan" && action.risk === ACTION_RISK.OBSERVE));
  assert.ok(result.actions.some((action) => action.id === "set_wifi_channel" && action.risk === ACTION_RISK.CONFIRM));
});
