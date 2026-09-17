# Edge Telemetry Bench

> **ISOLATE INTERROGATOR // SEC.SURVEILLANCE.MESH**  
> An adversarial benchmarking suite and real-time telemetry interrogator built for serverless JavaScript isolates, edge runtimes, and client environment analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00.svg)](https://kit.svelte.dev/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5%20Runes-FF3E00.svg)](https://svelte.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-26-339933.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220.svg)](https://pnpm.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000.svg)](https://vercel.com/)

---

## Overview

**`edge-telemetry-bench`** is a high-precision diagnostic and adversarial inspection tool built with **SvelteKit**, **Svelte 5 Runes**, **Tailwind CSS v4**, and **`@lucide/svelte`**. It stress-tests and interrogates edge execution environments (such as Vercel Edge Functions, AWS Lambda@Edge, and Cloudflare Isolates) to measure runtime boundaries, side-channel timing limits, state isolation, and security controls in real time over an asynchronous NDJSON stream.

Built upon a modular Svelte 5 probe registry pipeline and universal reactive state engine (`telemetry.svelte.ts`), `edge-telemetry-bench` surfaces critical metrics regarding multi-tenant security, Spectre side-channels, JIT privileges, microarchitectural cache jitter, hardware exposure, and client privacy farbling.

---

## Key Telemetry & Diagnostic Vectors

The dashboard continuously streams and analyzes 18 core vectors across server isolates and client runtimes:

|   #    | Diagnostic Vector                   | Measurement Focus                                  | Primary Metrics Probed                                                               |
| :----: | :---------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **01** | **Server Isolate Base**             | Isolate life cycle & runtime footprint             | Uptime (`uptimeMs`), invocation count, global context keys count                     |
| **02** | **Cloud Platform & Region**         | Cloud hypervisor & execution environment           | Platform identity, cloud edge region, container architecture, Node/V8 runtime        |
| **03** | **Lifecycle & Heap Delta**          | Cold boot vs warm instance state                   | Cold-start detection (`isColdStart`), instance ID tag, V8 heap allocation deltas     |
| **04** | **Spectre Side-Channels**           | Speculative execution & timing attack surface      | `SharedArrayBuffer`, `Atomics` support, WASM SIMD128 vector compilation              |
| **05** | **Clock Resolution & Jitter**       | Microsecond timing precision & Spectre mitigations | High-resolution timer granularity (`minIncrementMs`), timer coarsening level         |
| **06** | **Microarchitectural Cache Jitter** | L1/L2 cache latency jitter & noisy neighbors       | Strided memory access latency (`ns`), jitter variance ratio, noisy neighbor activity |
| **07** | **WebCrypto Encryption**            | Native cryptographic engine throughput             | WebCrypto SHA-256 (`MB/s`), AES-GCM 256 throughput (`MB/s`), keyGen latency          |
| **08** | **State Pollution Bleed**           | Cross-request isolate & memory bleed               | Global variable pollution across requests, assigned node/worker instance tags        |
| **09** | **Engine JIT Privileges**           | Dynamic code execution safety                      | Dynamic code evaluation (`eval` / `Function()`) permissions and execution speed      |
| **10** | **Entropy Harvest Speed**           | Cryptographic seed generation throughput           | CSPRNG throughput rate (`MB/s`), entropy harvest duration                            |
| **11** | **WASM Sandbox Bounds**             | WebAssembly execution restrictions                 | Dynamic WASM compilation permissions, JIT compilation latency (`compileDurationMs`)  |
| **12** | **Serialization Stress**            | Heap pressure & object graph throughput            | JSON stringify/parse throughput (`MB/s`), structured clone latency, payload scale    |
| **13** | **Ephemeral Disk Medium**           | Local container filesystem availability            | File system write capability, disk type inference, 256KB write latency               |
| **14** | **Outbound Egress Pipeline**        | Outbound network permissions & internet access     | Outbound internet egress firewall status, ping RTT latency                           |
| **15** | **Multi-Resolver DNS Mesh**         | Edge gateway DNS resolution speed                  | Concurrent HEAD latency to Cloudflare (`1.1.1.1`), Google (`8.8.8.8`), Quad9 DNS     |
| **16** | **Network Surveillance**            | Edge proxy headers & privacy boundaries            | Leaked client IP headers, proxy routing hops (Direct vs. Multi-Hop), anonymity score |
| **17** | **Concurrency & Event Loop**        | Event loop starvation & thread execution           | Microtask scheduling lag (`ms`), synchronous CPU burn capacity (20ms ops)            |
| **18** | **Client Privacy Matrix**           | Client hardware & anti-fingerprint farbling        | AudioContext noise farbling, system font metrics, CPU cores, WebGL GPU renderer      |

---

## Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5 Runes API)
- **Adapter:** [@sveltejs/adapter-vercel](https://github.com/sveltejs/kit/tree/main/packages/adapter-vercel) (Vercel Serverless & Edge Functions)
- **Styling & CSS:** [Tailwind CSS v4](https://tailwindcss.com/) with CRT scanline aesthetics
- **UI Architecture:** Bespoke Svelte 5 Micro-Components (Zero-dependency UI)
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
git clone https://github.com/your-username/edge-telemetry-bench.git
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

A lightweight GitHub Actions pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) automatically runs on every push and pull request to verify code quality and type correctness using [`pnpm/setup`](https://github.com/pnpm/setup) with Node.js 26:

- `pnpm lint`: Code style and ESLint validation
- `pnpm check`: Svelte 5 and TypeScript type diagnostics
- `pnpm build`: Production build bundle verification

---

## Security & Usage Disclaimer

This tool is created for **security research, performance profiling, and edge architecture auditing**. Probing public edge runtimes with high memory/CPU stress tests may trigger rate limits or account suspensions on shared serverless platforms. Use responsibly and within your cloud provider's terms of service.

---

## Contributing

Contributions, issue reports, and PRs are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-vector`)
3. Commit your changes (`git commit -m 'Add new telemetry vector'`)
4. Verify tests and linting (`pnpm check && pnpm lint && pnpm build`)
5. Push to the branch (`git push origin feature/amazing-vector`)
6. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
