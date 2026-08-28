# SentryOS interface direction

## Product promise

> I can see and control my entire home network at a glance.

SentryOS should feel calm, technical and trustworthy. It is a local appliance interface first, not a cloud analytics product.

## Visual system

- Graphite navigation with light neutral work surfaces
- Electric blue for primary actions and selection
- Emerald, amber and rose reserved for semantic status
- Source Sans 3 for interface copy and IBM Plex Mono for addresses and identifiers
- Minimum 44 px interactive targets and responsive layouts from phone to desktop

## Interaction principles

- Always show WAN, radio and device health before configuration detail.
- Stage configuration edits in a visible pending-changes bar.
- Require confirmation for disconnecting or destructive operations.
- Keep firmware flashing disabled until hardware and recovery checks pass.
- Work without third-party analytics, cloud fonts or required internet services.

## Integration boundary

The current data is simulated. React views should consume a stable SentryOS data model so that a later `mock`, OpenWrt RPC or verified Tenda adapter can provide the same interface without redesigning the screens.

## SentryAI principles

- Treat AI output as a proposal, never as an executable router command.
- Automatically allow read-only observations, explicitly confirm reversible configuration changes, and block firmware or bootloader operations.
- Show evidence, expected impact and rollback for every proposed change.
- Keep AI provider credentials in a future local service, never in the browser bundle.
- Label simulated data and actions honestly until a verified hardware adapter is connected.
