# SentryOS local read-only bridge

This service connects the SentryOS dashboard to the stock Tenda AC10U v1.0 interface without flashing the router. It only logs in locally and reads `goform/GetSystemStatus`; it has no setter, reboot, firmware, or WAN-configuration route.

## Before starting

1. Connect your PC to a **LAN** port on the spare router with Ethernet.
2. Keep the Frogfoot ONT / WAN cable unplugged for the first test.
3. Log in to `http://192.168.0.1` in the stock interface and make a private configuration backup. Do not put that backup, passwords, or PPPoE credentials in this repository.
4. Confirm the router still opens normally in the stock interface.

## Configure and run

Create a private `.env.local` file beside `package.json`:

```dotenv
SENTRY_ROUTER_URL=http://192.168.0.1
SENTRY_ROUTER_USERNAME=admin
SENTRY_ROUTER_PASSWORD=replace-with-your-router-admin-password
```

Run the bridge in one terminal:

```powershell
npm run bridge
```

The first safe check is:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/v1/bridge/status
Invoke-RestMethod http://127.0.0.1:8787/api/v1/snapshot
```

The bridge deliberately listens only on `127.0.0.1`, so it cannot be reached from Wi-Fi or the internet. Its snapshot excludes WAN IP addresses, MAC addresses, router credentials and client identifiers.

## Current boundary

The bridge is not yet wired into the dashboard by default, and it intentionally has no write endpoint. Once the live snapshot shape has been observed and reviewed, SentryOS can display it in the dashboard. All configuration changes remain blocked until separately designed, confirmed and tested with a rollback route.
