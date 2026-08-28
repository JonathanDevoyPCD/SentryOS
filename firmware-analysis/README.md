# AC10U v1.0 stock firmware analysis

This is a static, non-flashing analysis of the stock image matching the router screenshots. Downloaded archives and extracted files are deliberately ignored by Git; only this evidence report is tracked.

## Source identity

- Router UI hardware version: `V1.0`
- Router UI firmware version: `V15.03.06.49_multi`
- Official product: Tenda AC10U v1.0
- Official release page: <https://www.tendacn.com/material/show/103795>
- Official archive URL: <https://static.tenda.com.cn/tdeweb/download/AC10U/US_AC10UV1.0RTL_V15.03.06.49_multi_TDE01.zip>
- Archive filename: `US_AC10UV1.0RTL_V15.03.06.49_multi_TDE01.zip`
- Upgrade image filename: `US_AC10UV1.0RTL_V15.03.06.49_multi_TDE01.bin`

Tenda describes this release as specific to AC10U v1.0 units already running the `V15.03.06.XX` firmware family. No image has been uploaded to the router.

## Integrity manifest

| File | Bytes | SHA-256 | SHA-512 |
| --- | ---: | --- | --- |
| `US_AC10UV1.0RTL_V15.03.06.49_multi_TDE01.zip` | 7,637,824 | `6ACE324A3F2978B10E94FC9436BBE128CD5EB05B1B325D9BAEFD572BCB8248EF` | `3C5782241B101DE3FD663346E5A8B1D414AEC6385C9A3C3CF133E1C1EAE102A92412D9C765290B67188FF7CFBDCE6839618DF683CA72B052B6D9BD891F9D7BCF` |
| `US_AC10UV1.0RTL_V15.03.06.49_multi_TDE01.bin` | 7,632,980 | `23F8BC304A9AEA7FEE629BC66F348A7CBBB42EBF65CA8060171673A4347C2B0C` | `EB200B290128B54256D090C19AC3C9B669AF25ED6E55F2811DD52440E90FE928FB6ECEFFD587311281F669A3B5C971897A5C83E78856D6CCFA179784A69DE37F` |

## Confirmed static findings

- Container: legacy U-Boot `uImage`
- Operating system / architecture: Linux, 32-bit little-endian MIPS32r2
- Image load address: `0x80000000`
- Image entry point: `0x80479500`
- uImage payload size: 7,632,916 bytes
- Root filesystem: SquashFS 4.0 compressed with XZ
- SquashFS block size: 131,072 bytes
- SquashFS inodes: 884
- Kernel module directory: `3.10.90`
- Userspace: uClibc and BusyBox `1.19.2`
- Vendor toolchain strings: Realtek MSDK 4.4.7 / GCC 4.4.7
- Vendor libraries include `libapmib`, `libChipApi`, `libmtdapi` and `librtlWifiSrc`
- The wireless library recognises RTL8812-family hardware, consistent with the 5 GHz radio used by this platform

The firmware confirms a Realtek MIPS platform, but the exact SoC identifier is not present in the extracted strings. `RTL8197FS` appears in public community device catalogues for AC10U v1, but it remains an unverified hypothesis for this unit and must not be used as the basis for a flashable build. A chip marking or boot log must confirm the exact suffix.

## Firmware-file layout

| Offset | Size | Contents |
| --- | ---: | --- |
| `0x000000-0x00003F` | 64 bytes | Legacy uImage header |
| `0x000040-0x206851` | 2,123,794 bytes | Vendor/kernel payload preceding the root filesystem |
| `0x206852-0x747851` | 5,509,120 bytes | Aligned SquashFS region; filesystem data uses 5,505,060 bytes |
| `0x747852-0x747853` | 2 bytes | Unclassified tail |

This is the layout of the upgrade file, not the physical SPI flash partition table. It does not reveal the bootloader, factory-data, calibration, settings or recovery partitions that may exist outside the uploaded image.

## Stock management interface

The extracted web application references 122 distinct `goform` endpoints. This is strong evidence that SentryOS can first use a local stock-firmware adapter rather than immediately replacing the firmware.

Useful read-only candidates include:

- `goform/GetSystemStatus`
- `goform/GetRouterStatus`
- `goform/getOnlineList`
- `goform/GetNetErrInfo`
- `goform/getWanParameters`
- `goform/WifiRadioGet`
- `goform/WifiAntijamGet`
- `goform/WifiBeamformingGet`
- `goform/WifiPowerGet`
- `goform/GetSySLogCfg`

Configuration endpoints have corresponding setters such as `WifiRadioSet`, `WifiAntijamSet` and `WanParameterSetting`. They must remain behind the SentryOS allowlist, confirmation and rollback flow.

The stock login page posts an MD5 digest of the administrator password to `/login/Auth`. SentryOS should reproduce this only inside a local backend adapter and should never expose the router password or its digest to SentryAI or the frontend bundle.

## Hardware-readiness status after analysis

| Requirement | Status |
| --- | --- |
| Hardware revision | Confirmed by UI as `V1.0` |
| Current firmware version | Confirmed as `V15.03.06.49_multi` |
| Exact stock archive and image filenames | Confirmed and hashed |
| CPU architecture | Confirmed as 32-bit little-endian MIPS32r2 |
| Exact SoC | Unconfirmed; Realtek MIPS platform only |
| RAM capacity | Not confirmed |
| Physical flash capacity | Not confirmed |
| Flash partition layout | Not confirmed; upgrade-file layout only |
| Bootloader and recovery | Partial clues only; not tested |
| Official OpenWrt support | Not confirmed |

The image contains a serial-console `ttyS0` login entry and bootloader-writing utilities, but neither proves a safe recovery procedure. No bootloader or flash write should be attempted from these clues.

## Safest implementation direction

1. Keep SentryOS running externally on a PC or small local server.
2. Build a backend adapter that authenticates locally and initially calls only read-only stock endpoints.
3. Capture and validate the returned JSON schemas while the spare router is connected offline.
4. Add allowlisted setters one at a time with pre-change snapshots, explicit confirmation and rollback.
5. Continue treating firmware flashing as blocked until RAM, flash, physical partitions and recovery are confirmed.

This path can deliver the custom SentryOS dashboard and SentryAI diagnostics without risking the router during early development.
