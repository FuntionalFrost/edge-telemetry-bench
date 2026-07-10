import type { DiagnosticStreamChunk } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';

const isolateSpawnTime = performance.now();
let globalActivationCount = 0;

export const GET: RequestHandler = async ({ request }) => {
	globalActivationCount++;
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			// Avoid 'any' by using our strict Discriminated Union type schema
			const sendChunk = (chunk: DiagnosticStreamChunk) => {
				controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
			};

			try {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const reqHeaders = request.headers;

				// 1. Environmental Self-Awareness
				sendChunk({
					type: 'identity',
					data: {
						spawnTime: isolateSpawnTime,
						uptimeMs: performance.now() - isolateSpawnTime,
						activations: globalActivationCount,
						globalKeysCount: Object.getOwnPropertyNames(globalThis).length,
						runtimeGlobals: {
							hasProcess: typeof process !== 'undefined',
							// Use 'in globalThis' to keep compiler happy in environments where these don't exist
							hasDeno: 'Deno' in globalThis,
							hasBun: 'Bun' in globalThis,
							hasWebAssembly: typeof WebAssembly !== 'undefined',
							hasCaches: 'caches' in globalThis
						}
					}
				});

				// 2. Spectre Mitigation Prober
				let lastTime = performance.now();
				const measurements: number[] = [];
				for (let i = 0; i < 500; i++) {
					const now = performance.now();
					if (now !== lastTime) {
						measurements.push(now - lastTime);
						lastTime = now;
					}
				}
				const minDetectedIncrement = measurements.length ? Math.min(...measurements) : 0;
				sendChunk({
					type: 'clock',
					data: {
						minIncrementMs: minDetectedIncrement,
						isCoarsened: minDetectedIncrement >= 0.1,
						estimatedMitigationLevel:
							minDetectedIncrement > 0.01 ? 'Aggressive Spectre Guard' : 'Low/None'
					}
				});

				// 3. WebAssembly Sandbox Interrogation
				let wasmCompiled = false;
				let wasmCompileTime = -1;
				if (typeof WebAssembly !== 'undefined') {
					try {
						const start = performance.now();
						const minimalWasmBytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]);
						await WebAssembly.compile(minimalWasmBytes);
						wasmCompiled = true;
						wasmCompileTime = performance.now() - start;
					} catch {
						wasmCompiled = false;
					}
				}
				sendChunk({
					type: 'wasm',
					data: { allowed: wasmCompiled, compileDurationMs: wasmCompileTime }
				});

				// 4. Memory Allocation Boundaries
				let allocatedMegaBytes = 0;
				if (typeof WebAssembly !== 'undefined') {
					try {
						const wasmMemory = new WebAssembly.Memory({ initial: 4096 });
						allocatedMegaBytes = wasmMemory.buffer.byteLength / (1024 * 1024);
					} catch {
						try {
							const smallWasmMemory = new WebAssembly.Memory({ initial: 512 });
							allocatedMegaBytes = smallWasmMemory.buffer.byteLength / (1024 * 1024);
						} catch {
							allocatedMegaBytes = 0; // Completely memory restricted
						}
					}
				}
				sendChunk({ type: 'memory', data: { MaxSafeWasmAllocationMb: allocatedMegaBytes } });

				// 5. Outbound Network Egress Containment
				let internetAccess = false;
				let egressLatencyMs = -1;
				try {
					const netStart = performance.now();
					await fetch('https://1.1.1.1', {
						method: 'HEAD',
						signal: AbortSignal.timeout(600)
					});
					internetAccess = true;
					egressLatencyMs = performance.now() - netStart;
				} catch {
					internetAccess = false;
				}
				sendChunk({
					type: 'egress',
					data: {
						MaxSafeWasmAllocationMb: allocatedMegaBytes,
						outboundAccess: internetAccess,
						pingMs: egressLatencyMs
					}
				});

				// 6. Thread Pool & Starvation Burn
				const loopStart = performance.now();
				let counter = 0;
				while (performance.now() - loopStart < 20) {
					counter++;
				}
				const loopEnd = performance.now();

				const macroStart = performance.now();
				await new Promise<void>((r) => setTimeout(r, 0));

				sendChunk({
					type: 'concurrency',
					data: {
						syncBurnOps: counter,
						eventLoopLagMs: performance.now() - macroStart,
						totalBurnDuration: loopEnd - loopStart
					}
				});
			} catch (err: unknown) {
				const errMsg = err instanceof Error ? err.message : 'Unknown pipeline failure';
				sendChunk({ type: 'panic', data: { message: errMsg } });
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/x-ndjson',
			'Cache-Control': 'no-store, no-cache, must-revalidate'
		}
	});
};
