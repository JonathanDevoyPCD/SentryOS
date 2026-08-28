# SentryAI operating model

SentryAI is a guarded network operator inside SentryOS. It explains network conditions, runs approved diagnostics, prepares reports and proposes reversible configuration changes. It is not allowed to translate arbitrary model output directly into router commands.

## What it can do

- Analyse router health, connected clients, traffic and recent events
- Run channel, latency, DNS and throughput checks
- Explain likely causes of slow or unstable connections
- Recommend channel, channel-width, DNS and QoS changes
- Stage supported changes for explicit administrator approval
- Compare before-and-after measurements and produce health reports

Radio interference cannot be physically removed by software. SentryAI can detect likely congestion and reduce its effect by selecting a cleaner supported channel, adjusting channel width, steering suitable devices to 5 GHz, or recommending router placement changes.

## Safety classes

| Class | Behaviour | Examples |
| --- | --- | --- |
| Observe | May run automatically; makes no configuration change | Read status, channel scan, ping/DNS test, generate report |
| Confirm | Must show impact and rollback, then obtain explicit local approval | Change Wi-Fi channel, apply QoS, restart Wi-Fi, change DNS |
| Blocked | Rejected by policy | Flash firmware, write bootloader, disable firewall, enable remote administration |

Unknown actions are blocked by default. An AI response is treated as a proposal and must pass the deterministic SentryOS action policy before anything is staged.

## Architecture

```text
SentryOS browser interface
        |
        | same-origin HTTPS / local API
        v
SentryOS service + session controls
        |
        +--> SentryAI provider adapter (server-side API credential)
        |
        +--> deterministic action policy and audit log
                  |
                  v
        router adapter (mock / OpenWrt / verified Tenda)
```

The frontend never contains an AI API key. A future local SentryOS service stores the credential and calls the selected AI provider. It exposes only the narrow, same-origin endpoints required by the interface.

## Execution contract

Every configuration proposal must include:

1. The evidence that motivated it
2. Expected benefit and possible interruption
3. Exact allowlisted action and validated parameters
4. A pre-change snapshot
5. A rollback action
6. Post-change measurements
7. An audit entry naming the local administrator and result

The current prototype uses deterministic simulated responses. It does not contact an AI provider or alter router hardware.
