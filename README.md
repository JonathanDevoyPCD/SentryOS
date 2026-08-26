# SentryOS

SentryOS is a local-first router-management interface being designed for a spare Tenda AC10U AC1200 router. This repository currently contains the interactive frontend prototype—not flashable router firmware.

## Live prototype

After the first Pages deployment, the prototype will be available at:

**https://jonathandevoypcd.github.io/SentryOS/**

The dashboard uses realistic simulated data so we can settle the product design before binding it to a router API.

## Included screens

- Network overview and live topology
- Frogfoot/DHCP internet status and WAN settings
- 2.4 GHz, 5 GHz, guest and IoT Wi-Fi controls
- LAN, DHCP, connected devices and device history
- Firewall, access control and port forwarding
- USB storage, WireGuard VPN and Dynamic DNS concepts
- Router health, diagnostics, logs, backup and firmware safety gates

Controls are deliberately non-destructive. Settings create a local "pending changes" state; they do not touch router hardware.

## Run locally

```bash
npm install
npm run dev
```

Build the portable static bundle with:

```bash
npm run build
```

Hash-based routes and relative assets allow the same build to run under GitHub Pages now and from a router's local web server later.

## Architecture direction

The React interface is being kept separate from the future hardware adapter. Once the exact AC10U hardware revision and supported firmware base are confirmed, mock data can be replaced with an adapter for OpenWrt `ubus`/RPC or another verified local API.

Firmware flashing remains out of scope until we have confirmed the board revision, SoC, flash layout, stock firmware backup and a tested recovery path.

## Design and attribution

The interface is based on the structure of [Material Tailwind Dashboard React](https://github.com/creativetimofficial/material-tailwind-dashboard-react) by Creative Tim and is used under its MIT license. SentryOS uses React, Tailwind CSS, Heroicons and ApexCharts.

See [LICENSE.md](./LICENSE.md) for the original MIT license notice.
