# Edge Telemetry Bench

> **ISOLATE INTERROGATOR // SEC.SURVEILLANCE.MESH**  
> An adversarial benchmarking suite and real-time telemetry interrogator built for serverless JavaScript isolates, edge runtimes, and client environment analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00.svg)](https://kit.svelte.dev/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5%20Runes-FF3E00.svg)](https://svelte.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-26-339933.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220.svg)](https://pnpm.io/)
[![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-F38020.svg)](https://workers.cloudflare.com/)
[![Vercel Edge](https://img.shields.io/badge/Deploy-Vercel%20Edge-000000.svg)](https://vercel.com/)

---

## Overview

**`edge-telemetry-bench`** is a high-precision diagnostic and adversarial inspection tool built with **SvelteKit** and the **Carbon Design System**. It stress-tests and interrogates edge execution environments (such as Cloudflare Workers, Vercel Edge Functions, AWS Lambda@Edge, and Deno Deploy) to measure runtime boundaries, side-channel timing limits, state isolation, and security controls in real time over an asynchronous NDJSON stream.

By executing synthetic workloads, memory probes, and platform fingerprinting inside the server isolate and browser client, `edge-telemetry-bench` surfaces critical metrics regarding multi-tenant security, JIT privileges, hardware exposure, and network egress capabilities.

---

## Key Telemetry & Diagnostic Vectors

The dashboard continuously streams and analyzes 11 core vectors across server isolates and client runtimes:

|   #    | Diagnostic Vector                   | Measurement Focus                                  | Primary Metrics Probed                                                               |
| :----: | :---------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **01** | **Server Isolate Environment**      | Isolate life cycle & runtime footprint             | Uptime (`uptimeMs`), invocation count, global context keys count                     |
| **02** | **Side-Channel Clock Resolution**   | Microsecond timing precision & Spectre mitigations | High-resolution timer granularity (`minIncrementMs`), timer coarsening level         |
| **03** | **WASM Interpretation Sandbox**     | WebAssembly execution restrictions                 | Dynamic WASM compilation permissions, JIT compilation latency (`compileDurationMs`)  |
| **04** | **Boundary Exploration & Egress**   | Heap caps & outbound network permissions           | Max safe WebAssembly memory allocation (`MB`), outbound internet egress, ping RTT    |
| **05** | **Microtask Concurrency Mesh**      | Event loop starvation & thread execution           | Event loop scheduling lag (`ms`), synchronous CPU burn capacity (20ms ops)           |
| **06** | **State Pollution / Multi-Tenancy** | Cross-request isolate & memory bleed               | Global variable pollution across requests, assigned node/worker instance tags        |
| **07** | **Engine JIT Privileges**           | Dynamic code execution safety                      | Dynamic code evaluation (`eval` / `Function()`) permissions and execution speed      |
| **08** | **Entropy Harvesting Speed**        | Cryptographic seed generation throughput           | CSPRNG throughput rate (`MB/s`), entropy harvest duration                            |
| **09** | **Ephemeral Disk Subsystem**        | Local container filesystem availability            | File system write capability, disk type inference, 256KB write latency               |
| **10** | **Network Surveillance Matrix**     | Edge proxy headers & privacy boundaries            | Leaked client IP headers, proxy routing hops (Direct vs. Multi-Hop), anonymity score |
| **11** | **Client Device Correlation**       | Client hardware fingerprinting                     | CPU core count, WebGL GPU renderer string, WebGPU support                            |

---

## Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5 Runes API)
- **UI Design System:** [Carbon Components Svelte](https://github.com/carbon-design-system/carbon-components-svelte)
- **Icons:** [Carbon Icons Svelte](https://github.com/carbon-design-system/carbon-icons-svelte)
- **Validation & Schemas:** [Zod](https://zod.dev/) v4
- **Styling:** Custom Carbon dark graphite theme (`g100`) with CRT scanline aesthetics
- **Supported Deploy Targets:** Cloudflare Workers (`workerd`), Vercel Edge Functions, Vercel Serverless

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

Target-specific builds are controlled via the `DEPLOY_TARGET` environment variable:

```bash
# Cloudflare Workers build (outputs to .svelte-kit/cloudflare)
pnpm build:cloudflare

# Vercel Edge build (outputs to .vercel/output with edge runtime)
pnpm build:vercel

# Vercel Node.js Serverless build (outputs to .vercel/output with Node 22 serverless)
pnpm build:vercel:node

# Generic / Preview build
pnpm build
pnpm preview
```

---

## Deployment (Native Git Integration)

Deploying `edge-telemetry-bench` is zero-config via direct Git integration with Cloudflare and Vercel:

### 1. Cloudflare Workers / Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) $\rightarrow$ **Workers & Pages** $\rightarrow$ **Create** $\rightarrow$ **Connect to Git**.
2. Select your repository.
3. Configure build settings:
   - **Framework Preset**: `SvelteKit`
   - **Build command**: `pnpm build:cloudflare`
   - **Build output directory**: `.svelte-kit/cloudflare`
4. Click **Save and Deploy**.

### 2. Vercel (Edge vs. Node.js Serverless)

1. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
2. Under **Build & Development Settings**:
   - **Framework Preset**: `SvelteKit`
   - **Build Command**:
     - For **Vercel Edge**: `pnpm build:vercel`
     - For **Vercel Node.js Serverless (Non-Edge)**: `pnpm build:vercel:node`
3. Under **Environment Variables**, add:
   - `DEPLOY_TARGET` = `vercel`
   - _(Optional for Node.js)_ `VERCEL_RUNTIME` = `nodejs22.x`
4. Click **Deploy**.

---

## Continuous Integration (CI)

A lightweight GitHub Actions pipeline ([`.github/workflows/deploy.yaml`](.github/workflows/deploy.yaml)) automatically runs on every push and pull request to verify code quality and type correctness using [`pnpm/setup`](https://github.com/pnpm/setup) with Node.js 26:

- `pnpm lint`: Code style and ESLint validation
- `pnpm check`: Svelte 5 and TypeScript type diagnostics

---

## Security & Usage Disclaimer

This tool is created for **security research, performance profiling, and edge architecture auditing**. Probing public edge runtimes with high memory/CPU stress tests may trigger rate limits or account suspensions on shared serverless platforms. Use responsibly and within your cloud provider's terms of service.

---

## Contributing

Contributions, issue reports, and PRs are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-vector`)
3. Commit your changes (`git commit -m 'Add new telemetry vector'`)
4. Verify tests and linting (`pnpm check && pnpm lint`)
5. Push to the branch (`git push origin feature/amazing-vector`)
6. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
