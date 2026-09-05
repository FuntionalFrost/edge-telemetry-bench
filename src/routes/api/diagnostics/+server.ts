import { diagnosticStreamChunkSchema } from '$lib/types';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Stable native performance baseline anchors
const isolateSpawnTime = performance.now();
const isolateSpawnDateEpoch = Date.now();
let globalActivationCount = 0;

export const GET: RequestHandler = async ({ request }) => {
	globalActivationCount++;

	// Establish the clear, flat TransformStream writer pipeline
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const encoder = new TextEncoder();

	// Centralized safe chunk serializer
	const sendChunk = async (rawChunk: unknown) => {
		try {
			const validation = diagnosticStreamChunkSchema.safeParse(rawChunk);
			if (!validation.success) {
				// Uses the standardized Zod v4 tree utility cleanly
				console.error(
					'Server side telemetry schema violation bypassed:',
					z.treeifyError(validation.error)
				);
				return;
			}
			// Push straight into the network socket buffer
			await writer.write(encoder.encode(JSON.stringify(validation.data) + '\n'));
		} catch {
			// Connection cleanly severed by user navigation or cancellation actions
		}
	};

	// Use a top-level async execution slice to prevent blocking the main response delivery
	(async () => {
		try {
			// --- CHUNK 1: IDENTITY & STATE ---
			try {
				await sendChunk({
					type: 'identity',
					data: {
						spawnTime: isolateSpawnDateEpoch,
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
			} catch (e) {
				console.error('Identity probe failed', e);
			}

			// --- CHUNK 2: CONTEXT POLLUTION (THE LEAK TEST) ---
			try {
				const targetGlobal = globalThis as unknown as { __INTERROGATION_MARKER?: string };
				const detectedMarker = targetGlobal.__INTERROGATION_MARKER || null;
				const isPolluted = detectedMarker !== null;
				const newMarker = `node_token_0x${Math.random().toString(16).slice(2, 10)}`;
				targetGlobal.__INTERROGATION_MARKER = newMarker;

				await sendChunk({
					type: 'contextLeak',
					data: {
						contextIsPolluted: isPolluted,
						previousMarkerDetected: detectedMarker,
						currentAssignedMarker: newMarker
					}
				});
			} catch (e) {
				console.error('Context leak probe failed', e);
			}

			// --- CHUNK 3: JIT & COMPILATION EVALUATION LOCK ---
			try {
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
				await sendChunk({
					type: 'jit',
					data: { dynamicEvalAllowed: evalAllowed, evalDurationMs: evalTime }
				});
			} catch (e) {
				console.error('JIT probe failed', e);
			}

			// --- CHUNK 4: HYPERVISOR ENTROPY BENCHMARK ---
			try {
				const entropyStart = performance.now();
				const safeQuotaLimit = 64 * 1024;
				const entropyBuffer = new Uint8Array(safeQuotaLimit);

				if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
					crypto.getRandomValues(entropyBuffer);
				}

				const entropyDuration = performance.now() - entropyStart;
				const megabytesGenerated = safeQuotaLimit / (1024 * 1024);
				const rate = megabytesGenerated / (entropyDuration / 1000);

				await sendChunk({
					type: 'entropy',
					data: {
						entropyGenerationRateMbSec: isFinite(rate) && rate > 0 ? rate : 0,
						durationMs: entropyDuration
					}
				});
			} catch (e) {
				await sendChunk({
					type: 'entropy',
					data: { entropyGenerationRateMbSec: 0, durationMs: 0 }
				});
				console.error('Entropy benchmark bypassed', e);
			}

			// --- CHUNK 5: EPHEMERAL DISK WRITE-THRU PERFORMANCE ---
			try {
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
						const largePayload = '0'.repeat(1024 * 256);

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

				await sendChunk({
					type: 'disk',
					data: { hasDiskAccess, diskType, writeLatencyMs: writeLatency }
				});
			} catch (e) {
				await sendChunk({
					type: 'disk',
					data: { hasDiskAccess: false, diskType: 'Completely Sandboxed', writeLatencyMs: 0 }
				});
				console.error('Disk analysis bypassed', e);
			}

			// --- CHUNK 6: CLOCK GRANULARITY PROBE ---
			try {
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
				await sendChunk({
					type: 'clock',
					data: {
						minIncrementMs: minDetectedIncrement,
						isCoarsened: minDetectedIncrement >= 0.1 || minDetectedIncrement === 0,
						estimatedMitigationLevel:
							minDetectedIncrement === 0
								? 'Absolute Lockdown'
								: minDetectedIncrement >= 0.1
									? 'Aggressive Spectre Guard'
									: 'Low/None'
					}
				});
			} catch (e) {
				console.error('Clock diagnostics failed', e);
			}

			// --- CHUNK 7: WASM INTERPRETATION SANDBOX ---
			try {
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
				await sendChunk({
					type: 'wasm',
					data: { allowed: wasmCompiled, compileDurationMs: wasmCompileTime }
				});
			} catch (e) {
				console.error('WASM compilation probe failed', e);
			}

			// --- CHUNK 8: MEMORY ALLOCATION CEILING ---
			try {
				let allocatedMegaBytes = 0;
				if (typeof WebAssembly !== 'undefined') {
					try {
						const wasmMemory = new WebAssembly.Memory({ initial: 256 });
						allocatedMegaBytes = wasmMemory.buffer.byteLength / (1024 * 1024);
					} catch {
						allocatedMegaBytes = 0;
					}
				}
				await sendChunk({ type: 'memory', data: { MaxSafeWasmAllocationMb: allocatedMegaBytes } });
			} catch (e) {
				console.error('Memory floor allocation failed', e);
			}

			// --- CHUNK 9: OUTBOUND EGRESS CHECK ---
			try {
				let internetAccess = false;
				let egressLatencyMs = -1;
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 400);

				try {
					const netStart = performance.now();
					await fetch('https://1.1.1.1', { method: 'HEAD', signal: controller.signal });
					internetAccess = true;
					egressLatencyMs = performance.now() - netStart;
				} catch {
					internetAccess = false;
				} finally {
					clearTimeout(timeoutId);
				}

				await sendChunk({
					type: 'egress',
					data: { outboundAccess: internetAccess, pingMs: egressLatencyMs }
				});
			} catch (e) {
				console.error('Network egress test failed', e);
			}

			// --- CHUNK 10: SNOOPING & SURVEILLANCE ANALYSER ---
			try {
				const headers = request.headers;
				const clientIp =
					headers.get('cf-connecting-ip') ||
					headers.get('x-real-ip') ||
					headers.get('x-forwarded-for') ||
					headers.get('true-client-ip') ||
					'Direct Loopback';
				const hasProxyHeaders =
					headers.has('via') ||
					headers.has('forwarded') ||
					headers.has('cf-ray') ||
					headers.has('x-vercel-id') ||
					(headers.get('x-forwarded-for')?.split(',') ?? []).length > 1;

				let baseAnonymity = 100;
				if (hasProxyHeaders) baseAnonymity -= 30;
				if (headers.has('sec-ch-ua')) baseAnonymity -= 10;

				const hashInput = `${clientIp}-${headers.get('user-agent')}`;
				let hash = 0;
				for (let i = 0; i < hashInput.length; i++) {
					hash = (hash << 5) - hash + hashInput.charCodeAt(i);
					hash |= 0;
				}

				await sendChunk({
					type: 'surveillance',
					data: {
						clientIpHeaderLeaked: clientIp.split(',')[0].trim(),
						proxyChainDetected: hasProxyHeaders,
						requestFingerprintHash: `REQ-SIG-${Math.abs(hash).toString(16).toUpperCase()}`,
						anonymityScore: baseAnonymity
					}
				});
			} catch (e) {
				console.error('Surveillance analytics failed', e);
			}

			// --- CHUNK 11: CONCURRENCY & TASK STARVATION ---
			try {
				const loopStart = performance.now();
				let counter = 0;
				while (performance.now() - loopStart < 20) {
					counter++;
				}
				const loopEnd = performance.now();
				const macroStart = performance.now();
				await new Promise<void>((r) => setTimeout(r, 0));

				await sendChunk({
					type: 'concurrency',
					data: {
						syncBurnOps: counter,
						eventLoopLagMs: performance.now() - macroStart,
						totalBurnDuration: loopEnd - loopStart
					}
				});
			} catch (e) {
				console.error('Concurrency exhaustion tracking failed', e);
			}
		} finally {
			// CRITICAL PROTECTION: Guarantees the stream is terminated safely under all conditions
			writer.close();
		}
	})();

	// Hand off the readable channel instantly to avoid local dev server hanging timeouts
	return new Response(readable, {
		headers: {
			'Content-Type': 'application/x-ndjson',
			'Cache-Control': 'no-store, no-cache, must-revalidate'
		}
	});
};
