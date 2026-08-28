export const ACTION_RISK = Object.freeze({
  OBSERVE: "observe",
  CONFIRM: "confirm",
  BLOCKED: "blocked",
});

export const actionCatalog = Object.freeze({
  run_channel_scan: {
    label: "Scan nearby Wi-Fi channels",
    risk: ACTION_RISK.OBSERVE,
    impact: "Reads radio utilisation without changing settings.",
    rollback: "No rollback needed; no setting is changed.",
  },
  run_speed_test: {
    label: "Run connection speed test",
    risk: ACTION_RISK.OBSERVE,
    impact: "Uses a short burst of bandwidth to measure the connection.",
    rollback: "No rollback needed; no setting is changed.",
  },
  run_dns_test: {
    label: "Check DNS response time",
    risk: ACTION_RISK.OBSERVE,
    impact: "Queries approved test names using the configured resolver.",
    rollback: "No rollback needed; no setting is changed.",
  },
  generate_health_report: {
    label: "Generate network health report",
    risk: ACTION_RISK.OBSERVE,
    impact: "Summarises sanitised local observations.",
    rollback: "The generated report can be deleted.",
  },
  set_wifi_channel: {
    label: "Change Wi-Fi channel",
    risk: ACTION_RISK.CONFIRM,
    impact: "Wireless devices may disconnect briefly while the radio restarts.",
    rollback: "Restore the previous channel from the pre-change snapshot.",
  },
  set_channel_width: {
    label: "Change channel width",
    risk: ACTION_RISK.CONFIRM,
    impact: "May trade peak speed for stability in congested areas.",
    rollback: "Restore the previous channel width.",
  },
  set_device_priority: {
    label: "Prioritise a device",
    risk: ACTION_RISK.CONFIRM,
    impact: "Other devices may receive less bandwidth while priority is active.",
    rollback: "Remove the temporary priority rule.",
  },
  restart_wifi: {
    label: "Restart Wi-Fi radios",
    risk: ACTION_RISK.CONFIRM,
    impact: "All wireless clients will disconnect for a short period.",
    rollback: "Radios automatically return with their previous configuration.",
  },
  set_dns: {
    label: "Change DNS resolver",
    risk: ACTION_RISK.CONFIRM,
    impact: "Name resolution may briefly pause and the new resolver sees queries.",
    rollback: "Restore the previous resolver addresses.",
  },
  flash_firmware: {
    label: "Flash router firmware",
    risk: ACTION_RISK.BLOCKED,
    impact: "An incompatible image can permanently stop the router from booting.",
    rollback: "Blocked until hardware identity and recovery are verified.",
  },
  write_bootloader: {
    label: "Write bootloader",
    risk: ACTION_RISK.BLOCKED,
    impact: "A failed write can remove normal recovery options.",
    rollback: "Blocked by SentryOS policy.",
  },
  disable_firewall: {
    label: "Disable firewall",
    risk: ACTION_RISK.BLOCKED,
    impact: "Would expose the local network to untrusted traffic.",
    rollback: "Blocked by SentryOS policy.",
  },
  enable_remote_admin: {
    label: "Enable remote administration",
    risk: ACTION_RISK.BLOCKED,
    impact: "Would expose the management surface outside the local network.",
    rollback: "Blocked by SentryOS policy.",
  },
  change_admin_credentials: {
    label: "Change administrator credentials",
    risk: ACTION_RISK.BLOCKED,
    impact: "Could lock the administrator out of the router.",
    rollback: "Blocked from AI execution; use the dedicated settings flow.",
  },
});

const unknownAction = (id) => ({
  label: `Unknown action: ${id || "missing identifier"}`,
  risk: ACTION_RISK.BLOCKED,
  impact: "The action is not in the SentryOS allowlist.",
  rollback: "No execution permitted.",
});

export function classifyAction(action = {}) {
  const definition = actionCatalog[action.id] ?? unknownAction(action.id);
  return { ...definition, ...action, risk: definition.risk };
}

export function validateActionPlan(actions = []) {
  const normalized = actions.map(classifyAction);
  const blocked = normalized.filter((action) => action.risk === ACTION_RISK.BLOCKED);
  return {
    actions: normalized,
    blocked,
    canStage: blocked.length === 0,
    requiresConfirmation: normalized.some((action) => action.risk === ACTION_RISK.CONFIRM),
  };
}

export function assertActionPlanSafe(actions = []) {
  const plan = validateActionPlan(actions);
  if (plan.blocked.length) {
    throw new Error(`SentryOS blocked: ${plan.blocked.map((action) => action.label).join(", ")}`);
  }
  return plan;
}
