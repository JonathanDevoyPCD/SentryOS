# SentryOS hardware readiness gate

SentryOS is currently a safe interface prototype. Do not build, upload or test a flashable image until the exact router hardware and a recovery route are known.

## Required evidence

- Hardware revision printed on the enclosure and reported by the firmware
- Current firmware version and the exact firmware filename previously installed
- Chipset / SoC model
- RAM capacity and flash capacity
- Flash partition layout
- Bootloader type, recovery mode and tested recovery procedure
- Confirmed OpenWrt device support, or a controlled analysis of the exact matching stock firmware image

## First screenshots to collect

After connecting the spare router, capture its:

- Status page
- System Information page
- Firmware / Upgrade page

Before sharing a screenshot, hide every password, serial number, WPS PIN and public IP address. Also remove session tokens, QR codes, PPPoE credentials and any ISP account identifiers if they appear.

## Firmware safety gate

The SentryOS interface may be developed and tested with simulated data before this evidence is available. Firmware flashing, bootloader writes and partition changes stay blocked until the evidence above has been reviewed and a recoverable hardware-specific plan exists.

## Current evidence

The router UI and matching official stock image have now been reviewed. Hardware `V1.0`, firmware `V15.03.06.49_multi`, the exact archive/image filenames, MIPS32r2 architecture and the upgrade-file layout are confirmed. RAM, physical flash capacity, flash partitions and recovery remain unconfirmed.

See [the stock firmware analysis](../firmware-analysis/README.md) for hashes, static findings and the proposed non-flashing adapter path.
