import type { DiagnosticStreamChunk } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';

const isolateSpawnTime = performance.now();
let globalActivationCount = 0;

export const GET: RequestHandler = async ({ request }) => {
	globalActivationCount++;
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const sendChunk = (chunk: DiagnosticStreamChunk) => {
				try {
					controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
				} catch {
					// Stream context closed prematurely by client navigation
				}
			};

			// --- CHUNK 1: IDENTITY & STATE ---
			try {
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

				sendChunk({
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
				sendChunk({
					type: 'jit',
					data: { dynamicEvalAllowed: evalAllowed, evalDurationMs: evalTime }
				});
			} catch (e) {
				console.error('JIT probe failed', e);
			}

			// --- CHUNK 4: HYPERVISOR ENTROPY BENCHMARK ---
			try {
				const entropyStart = performance.now();
				// CRITICAL FIX: Limited to 64KB to prevent Web Crypto QuotaExceededError violations
				const safeQuotaLimit = 64 * 1024;
				const entropyBuffer = new Uint8Array(safeQuotaLimit);

				if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
					crypto.getRandomValues(entropyBuffer);
				}

				const entropyDuration = performance.now() - entropyStart;
				const megabytesGenerated = safeQuotaLimit / (1024 * 1024);
				const rate = megabytesGenerated / (entropyDuration / 1000);

				sendChunk({
					type: 'entropy',
					data: {
						entropyGenerationRateMbSec: isFinite(rate) && rate > 0 ? rate : 0,
						durationMs: entropyDuration
					}
				});
			} catch (e) {
				// Fallback instead of exploding the entire stream payload
				sendChunk({ type: 'entropy', data: { entropyGenerationRateMbSec: 0, durationMs: -1 } });
				console.error('Entropy benchmark bypassed due to hardware layer restrictions', e);
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
						const largePayload = '0'.repeat(1024 * 256); // 256KB quick burst check

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
			} catch (e) {
				sendChunk({
					type: 'disk',
					data: { hasDiskAccess: false, diskType: 'Completely Sandboxed', writeLatencyMs: -1 }
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
				sendChunk({
					type: 'clock',
					data: {
						minIncrementMs: minDetectedIncrement,
						isCoarsened: minDetectedIncrement >= 0.1 || minDetectedIncrement === 0,
						estimatedMitigationLevel:
							minDetectedIncrement === 0
								? 'Absolute Edge Lockdown'
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
				sendChunk({
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
						const wasmMemory = new WebAssembly.Memory({ initial: 2048 }); // Probe 128MB initially to prevent process termination
						allocatedMegaBytes = wasmMemory.buffer.byteLength / (1024 * 1024);
					} catch {
						try {
							const smallWasmMemory = new WebAssembly.Memory({ initial: 512 }); // 32MB fallback
							allocatedMegaBytes = smallWasmMemory.buffer.byteLength / (1024 * 1024);
						} catch {
							allocatedMegaBytes = 0;
						}
					}
				}
				sendChunk({ type: 'memory', data: { MaxSafeWasmAllocationMb: allocatedMegaBytes } });
			} catch (e) {
				console.error('Memory floor allocation failed', e);
			}

			// --- CHUNK 9: OUTBOUND EGRESS CHECK ---
			try {
				let internetAccess = false;
				let egressLatencyMs = -1;
				try {
					const netStart = performance.now();
					await fetch('https://1.1.1.1', { method: 'HEAD', signal: AbortSignal.timeout(400) });
					internetAccess = true;
					egressLatencyMs = performance.now() - netStart;
				} catch {
					internetAccess = false;
				}
				sendChunk({
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
					headers.get('x-forwarded-for') || headers.get('true-client-ip') || 'Direct Loopback';
				const hasProxyHeaders =
					headers.has('via') ||
					headers.has('forwarded') ||
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

				sendChunk({
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

				sendChunk({
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

			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/x-ndjson',
			'Cache-Control': 'no-store, no-cache, must-revalidate'
		}
	});
};
