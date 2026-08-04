# `edge-telemetry-bench`

> **ISOLATE INTERROGATOR // SEC.SURVEILLANCE.MESH**
> An adversarial benchmarking suite and real-time telemetry interrogator built for serverless JavaScript isolates, edge runtimes, and client environment analysis.

---

## Overview

**`edge-telemetry-bench`** is a high-precision diagnostic and adversarial inspection tool built with **SvelteKit** and **Carbon Design System**. It stress-tests and interrogates edge execution environments (such as Cloudflare Workers, Vercel Edge Functions, AWS Lambda@Edge, and Deno Deploy) to measure runtime boundaries, side-channel timing limits, state isolation, and security controls in real time.

By running synthetic workloads, memory probes, and platform fingerprinting inside the server isolate and browser client, `edge-telemetry-bench` surfaces critical metrics regarding multi-tenant security, JIT privileges, hardware exposure, and egress capabilities.

---

## Key Telemetry & Diagnostic Modules

The dashboard continuously streams and analyzes 11 core vectors across server isolates and client runtimes:

| #      | Diagnostic Vector                   | Measurement Focus                                  | Primary Metrics Probed                                                               |
| ------ | ----------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
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
- **Typography:** IBM Plex Mono / IBM Plex Sans
- **Styles:** Custom Carbon dark/cyberpunk themes

---

## Usage & Interrogation

1. Load the dashboard in your browser.
2. The initial **Ingress RTT** and client hardware specs (Logical Cores, GPU, WebGPU) will be fingerprinted immediately.
3. Click **LAUNCH ADVERSARIAL INSPECTION** to trigger the isolate stress runner.
4. The system will execute synthetic WASM compilations, synchronous memory allocations, timer precision tests, and multi-tenant memory leak checks.
5. If the isolate crashes due to container memory bounds (OOM) or hypervisor execution timeouts, the engine catches the halt state and triggers the `Isolate Execution Halted` alert banner.

---

## Security & Usage Disclaimer

This tool is created for **security research, performance profiling, and edge architecture auditing**. Probing public edge runtimes with high memory/CPU stress tests may trigger rate limits or account suspensions on shared serverless platforms. Use responsibly and within your cloud provider's terms of service.
