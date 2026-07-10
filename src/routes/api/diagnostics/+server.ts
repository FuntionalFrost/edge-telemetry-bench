import type { DiagnosticStreamChunk } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';

const isolateSpawnTime = performance.now();
let globalActivationCount = 0;

// Removed `{ request }` destructuring since it isn't consumed by our raw global probes
export const GET: RequestHandler = async () => {
	globalActivationCount++;
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const sendChunk = (chunk: DiagnosticStreamChunk) => {
				controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
			};

			try {
				// 1. IDENTITY & STATE
				sendChunk({
					type: 'identity',
					data: {
						spawnTime: isolateSpawnTime,
						uptimeMs: performance.now() - isolateSpawnTime,
						activations: globalActivationCount,
						globalKeysCount: Object.getOwnPropertyNames(globalThis).length,
						runtimeGlobals: {
							hasProcess: typeof process !== 'undefined',
							hasDeno: 'Deno' in globalThis,
							hasBun: 'Bun' in globalThis,
							hasWebAssembly: typeof WebAssembly !== 'undefined',
							hasCaches: 'caches' in globalThis
						}
					}
				});

				// 2. CONTEXT POLLUTION (THE LEAK TEST)
				const targetGlobal = globalThis as unknown as { __INTERROGATION_MARKER?: string };
				const detectedMarker = targetGlobal.__INTERROGATION_MARKER || null;
				const isPolluted = detectedMarker !== null;

				const newMarker = `node_token_0x${Math.random().toString(16).slice(2, 10)}`;
				targetGlobal.__INTERROGATION_MARKER = newMarker;

				sendChunk({
					type: 'contextLeak',
					data: {
						contextIsPolluted: isPolluted,
						previousMarkerDetected: detectedMarker,
						currentAssignedMarker: newMarker
					}
				});

				// 3. JIT & COMPILATION EVALUATION LOCK
				let evalAllowed = false;
				let evalTime = -1;
				try {
					const evalStart = performance.now();
					const dynamicFunc = new Function('a', 'b', 'return a * b') as (
						a: number,
						b: number
					) => number;
					if (dynamicFunc(6, 7) === 42) {
						evalAllowed = true;
						evalTime = performance.now() - evalStart;
					}
				} catch {
					evalAllowed = false;
				}
				sendChunk({
					type: 'jit',
					data: { dynamicEvalAllowed: evalAllowed, evalDurationMs: evalTime }
				});

				// 4. HYPERVISOR ENTROPY BENCHMARK
				const entropyStart = performance.now();
				const entropyBuffer = new Uint8Array(1024 * 1024);
				if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
					crypto.getRandomValues(entropyBuffer);
				}
				const entropyDuration = performance.now() - entropyStart;
				const rate = 1 / (entropyDuration / 1000);

				sendChunk({
					type: 'entropy',
					data: {
						entropyGenerationRateMbSec: isFinite(rate) ? rate : 0,
						durationMs: entropyDuration
					}
				});

				// 5. EPHEMERAL DISK WRITE-THRU PERFORMANCE
				let hasDiskAccess = false;
				let diskType: 'Persistent/Ephemeral Physical' | 'In-Memory Tmpfs' | 'Completely Sandboxed' =
					'Completely Sandboxed';
				let writeLatency = -1;

				if (typeof process !== 'undefined' && process.versions?.node) {
					try {
						const fs = await import('fs/promises');
						const path = await import('path');
						const os = await import('os');

						const tempDir = os.tmpdir();
						const testFilePath = path.join(tempDir, `probe_${Date.now()}.log`);
						const largePayload = '0'.repeat(1024 * 512);

						const dStart = performance.now();
						await fs.writeFile(testFilePath, largePayload);
						await fs.unlink(testFilePath);
						writeLatency = performance.now() - dStart;
						hasDiskAccess = true;
						diskType = writeLatency < 0.8 ? 'In-Memory Tmpfs' : 'Persistent/Ephemeral Physical';
					} catch {
						hasDiskAccess = false;
					}
				}

				sendChunk({
					type: 'disk',
					data: { hasDiskAccess, diskType, writeLatencyMs: writeLatency }
				});

				// 6. CLOCK GRANULARITY PROBE
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

				// 7. WASM INTERPRETATION SANDBOX
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

				// 8. MEMORY ALLOCATION CEILING
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
							allocatedMegaBytes = 0;
						}
					}
				}
				sendChunk({ type: 'memory', data: { MaxSafeWasmAllocationMb: allocatedMegaBytes } });

				// 9. OUTBOUND EGRESS CHECK
				let internetAccess = false;
				let egressLatencyMs = -1;
				try {
					const netStart = performance.now();
					await fetch('https://1.1.1.1', { method: 'HEAD', signal: AbortSignal.timeout(500) });
					internetAccess = true;
					egressLatencyMs = performance.now() - netStart;
				} catch {
					internetAccess = false;
				}
				sendChunk({
					type: 'egress',
					data: { outboundAccess: internetAccess, pingMs: egressLatencyMs }
				});

				// 10. CONCURRENCY & TASK STARVATION
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
				const errMsg = err instanceof Error ? err.message : 'Critical Stream Fracture';
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
