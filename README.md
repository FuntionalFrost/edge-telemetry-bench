# Edge Telemetry Bench

> **ISOLATE INTERROGATOR // SEC.SURVEILLANCE.MESH**  
> An adversarial benchmarking suite and real-time telemetry interrogator built for serverless JavaScript isolates, edge runtimes, and client environment analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00.svg)](https://kit.svelte.dev/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5%20Runes-FF3E00.svg)](https://svelte.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24%20|%2026-339933.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220.svg)](https://pnpm.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000.svg)](https://vercel.com/)

---

## Overview

**`edge-telemetry-bench`** is a high-precision diagnostic and adversarial inspection tool built with **SvelteKit**, **Svelte 5 Runes**, **Tailwind CSS v4**, and **`@lucide/svelte`**. It stress-tests and interrogates edge execution environments (such as Vercel Edge Functions, AWS Lambda@Edge, and Cloudflare Isolates) to measure runtime boundaries, side-channel timing limits, state isolation, and security controls in real time over an asynchronous NDJSON stream.

Built upon a **Hybrid Declarative Vector Registry** and universal reactive state engine (`telemetry.svelte.ts`), `edge-telemetry-bench` surfaces critical metrics regarding multi-tenant security, Spectre side-channels, JIT privileges, microarchitectural cache jitter, hardware exposure, and client privacy farbling.

---

## Key Telemetry & Diagnostic Vectors

The dashboard continuously streams and analyzes **27 vectors** across 6 domain categories:

|   #    | Diagnostic Vector             | Domain Category     | Primary Metrics Probed                                                                   |
| :----: | :---------------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| **01** | **Server Isolate Base**       | Server Isolates     | Uptime (`uptimeMs` / `s`), activation count, global context keys count                   |
| **02** | **Cloud Platform & Region**   | Server Isolates     | Platform identity, cloud edge region, container architecture, Node/V8 runtime            |
| **03** | **Lifecycle & Heap Delta**    | Server Isolates     | Cold-start state (`COLD BOOT` vs `WARM ISOLATE`), instance ID tag, V8 heap allocation    |
| **04** | **Spectre Side-Channels**     | Security & Spectre  | `SharedArrayBuffer` exposure, WASM SIMD128 active state, vulnerability profile score     |
| **05** | **Clock Resolution & Jitter** | Security & Spectre  | High-resolution timer granularity (`minIncrementMs` / `ns`), hypervisor clamping         |
| **06** | **Microarchitectural Cache**  | Server Isolates     | L1/L2 strided memory latency (`ns`), jitter variance ratio, noisy neighbor activity      |
| **07** | **WebCrypto Encryption**      | WebCrypto & Entropy | WebCrypto SHA-256 (`MB/s`), AES-GCM 256 throughput (`MB/s`), keyGen latency              |
| **08** | **State Pollution Bleed**     | Security & Spectre  | Isolate context bleed (`DIRTY HEAP` vs `PURE ISOLATE`), assigned per-request token       |
| **09** | **Engine JIT Privileges**     | Security & Spectre  | Dynamic code evaluation (`eval` / `Function()`) permissions and execution speed          |
| **10** | **Entropy Harvest Speed**     | WebCrypto & Entropy | CSPRNG throughput rate (`MB/s`), sub-millisecond entropy harvest latency (`µs`)          |
| **11** | **WASM Sandbox Bounds**       | Security & Spectre  | Dynamic WASM compilation permissions, JIT compile latency (`compileDurationMs`)          |
| **12** | **Serialization Stress**      | Server Isolates     | JSON throughput (`MB/s`), structured clone latency, payload scale (`KB`)                 |
| **13** | **Ephemeral Disk Medium**     | Server Isolates     | Local container filesystem state (`/tmp`), storage medium, 256KB write latency           |
| **14** | **Outbound Egress Pipeline**  | Egress & DNS        | Outbound internet egress firewall status (`OPEN` vs `FIREWALLED`), gateway ping RTT      |
| **15** | **Multi-Resolver DNS Mesh**   | Egress & DNS        | Concurrent HEAD latency to Cloudflare (`1.1.1.1`), Google (`8.8.8.8`), Quad9 (`9.9.9.9`) |
| **16** | **Network Surveillance**      | Egress & DNS        | Leaked client IP headers, proxy routing hops (Direct vs Multi-Hop), anonymity score      |
| **17** | **Concurrency & Event Loop**  | Server Isolates     | Microtask event loop scheduling lag (`ms`), synchronous CPU burn ops (20ms)              |
| **18** | **Client Privacy Matrix**     | Client Forensics    | Web Audio farbling detection, system font metrics count, CPU cores, WebGL GPU unmask     |
| **19** | **Client Hints (UA-CH)**      | Client Forensics    | High-entropy User-Agent Client Hints (`platform`, `architecture`, `bitness`)             |
| **20** | **Network Connection API**    | Client Forensics    | Effective connection type (4G/5G/WiFi), downlink bandwidth (`MB/s`), client RTT          |
| **21** | **Subresource Timing**        | Client Forensics    | PerformanceResourceTiming asset count, average TTFB (`ms`), transfer volume (`MB`)       |
| **22** | **WebRTC ICE Discovery**      | Client Forensics    | Interactive Connectivity Establishment (ICE) candidate gathering duration & types        |
| **23** | **Network Packet Jitter**     | Client Forensics    | Ping jitter variance (`ms`), min-max ping range, stability rating classification         |
| **24** | **Long Tasks & Thread Lag**   | Client Forensics    | PerformanceObserver long task stalls (>50ms), max task duration, total blocking time     |
| **25** | **rAF Refresh & Frame Drops** | Client Forensics    | Physical display refresh rate (`Hz`), realtime rendering FPS, dropped frame count        |
| **26** | **DOM Layout Thrashing**      | Client Forensics    | Forced synchronous reflow throughput (`ops/s`), mean reflow duration (`ms`)              |
| **27** | **Telemetry Controller**      | Controller          | Real-time NDJSON stream pipeline status, gateway latency, adversarial run trigger        |

---

## Architectural Highlights

- **Executive Summary HUD Banner:** Instant 4-pillar overview (Runtime Host, Spectre Risk, Network Mesh Anonymity, Client Forensics) above the telemetry grid.
- **Hybrid Declarative Vector Registry:** All 26 diagnostic vector schemas, formatters, and gauge properties are centralized in [`src/lib/config/telemetry-registry.ts`](src/lib/config/telemetry-registry.ts), keeping the main page template down to ~55 lines.
- **Adaptive Precision Formatting:** Automatic sub-millisecond unit scaling (`µs` vs `ms`), long uptime conversion (`s`), and transfer volume scaling (`KB`/`MB`).
- **Semantic Alert Coloring:** Real-time dynamic color triggers that prevent false-positive alarms on healthy 0-value states while highlighting high-risk anomalies in high-contrast neon tones.
- **Tactical Cyber Aesthetic:** Custom dark scanline backdrop, segmented LED CyberMeters, high-contrast tooltips, and bespoke cyber scrollbars.

---

## Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5 Runes API)
- **Adapter:** [@sveltejs/adapter-vercel](https://github.com/sveltejs/kit/tree/main/packages/adapter-vercel) (Vercel Serverless & Edge Functions)
- **Styling & CSS:** [Tailwind CSS v4](https://tailwindcss.com/) with CRT scanline aesthetics
- **UI Architecture:** Svelte 5 Micro-Components (`<TelemetryTile>`, `<MetricRow>`, `<CyberMeter>`, `<Badge>`) with `tailwind-variants` & [Yaxa](https://github.com/) v1.10.0 integration
- **Icons:** [@lucide/svelte](https://lucide.dev/) (Tree-shakeable inline SVG icons)
- **Validation & Schemas:** [Zod](https://zod.dev/) v4
- **Deployment Platform:** [Vercel](https://vercel.com/) (Edge Functions & Node.js Serverless Functions)

---

## Quick Start & Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) v24 or v26
- [pnpm](https://pnpm.io/) v11 (`corepack enable pnpm` or `npm install -g pnpm`)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/FuntionalFrost/edge-telemetry-bench.git
cd edge-telemetry-bench

# 2. Install dependencies
pnpm install

# 3. Start local development server
pnpm dev
```

Open `http://localhost:5173` to view the live dashboard.

---

## Building for Production

Builds use `@sveltejs/adapter-vercel` and output directly to `.vercel/output`:

```bash
# Standard production build for Vercel
pnpm build

# Local preview of the build
pnpm preview
```

---

## Deployment (Vercel)

Deploying `edge-telemetry-bench` is zero-config via direct Git integration with Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
2. Vercel automatically detects **SvelteKit** and configures the build settings:
   - **Framework Preset**: `SvelteKit`
   - **Build Command**: `pnpm build`
   - **Output Directory**: Automatically handled by `@sveltejs/adapter-vercel`
3. Click **Deploy**.

---

## Continuous Integration (CI)

A lightweight GitHub Actions pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) automatically runs on every push and pull request to verify code quality and type correctness using [`pnpm/action-setup`](https://github.com/pnpm/action-setup) with Node.js 24:

- `pnpm lint`: Code style and ESLint validation
- `pnpm check`: Svelte 5 and TypeScript type diagnostics
- `pnpm build`: Production build bundle verification

---

## Security & Usage Disclaimer

This tool is created for **security research, performance profiling, and edge architecture auditing**. Probing public edge runtimes with high memory/CPU stress tests may trigger rate limits or account suspensions on shared serverless platforms. Use responsibly and within your cloud provider's terms of service.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
