// src/lib/client/telemetry.svelte.ts
import { CLIENT_PROBES } from '#lib/client/probes/index.js';
import type {
	CacheJitterChunk,
	ClientHardwareMetrics,
	ClockChunk,
	CloudMetadataChunk,
	ConcurrencyChunk,
	ContextLeakChunk,
	CryptoBenchChunk,
	DiagnosticChunkType,
	DiagnosticStreamChunk,
	EphemeralDiskChunk,
	EgressChunk,
	EntropyChunk,
	IdentityChunk,
	IsolateLifecycleChunk,
	JitChunk,
	MemoryChunk,
	MultiEgressMatrixChunk,
	SerializationStressChunk,
	SpectrePrimitivesChunk,
	SurveillanceChunk,
	WasmChunk
} from '#lib/types.js';
import { diagnosticStreamChunkSchema } from '#lib/types.js';
import { SvelteDate } from 'svelte/reactivity';
import { toast } from 'yaxa-svelte';

export interface TelemetryState {
	identity: IdentityChunk | null;
	contextLeak: ContextLeakChunk | null;
	cloudMetadata: CloudMetadataChunk | null;
	isolateLifecycle: IsolateLifecycleChunk | null;
	spectrePrimitives: SpectrePrimitivesChunk | null;
	clock: ClockChunk | null;
	cacheJitter: CacheJitterChunk | null;
	cryptoBench: CryptoBenchChunk | null;
	jit: JitChunk | null;
	entropy: EntropyChunk | null;
	wasm: WasmChunk | null;
	memory: MemoryChunk | null;
	serializationStress: SerializationStressChunk | null;
	disk: EphemeralDiskChunk | null;
	egress: EgressChunk | null;
	multiEgressMatrix: MultiEgressMatrixChunk | null;
	surveillance: SurveillanceChunk | null;
	concurrency: ConcurrencyChunk | null;
	client: ClientHardwareMetrics | null;
}

const initialTelemetryState: TelemetryState = {
	identity: null,
	contextLeak: null,
	cloudMetadata: null,
	isolateLifecycle: null,
	spectrePrimitives: null,
	clock: null,
	cacheJitter: null,
	cryptoBench: null,
	jit: null,
	entropy: null,
	wasm: null,
	memory: null,
	serializationStress: null,
	disk: null,
	egress: null,
	multiEgressMatrix: null,
	surveillance: null,
	concurrency: null,
	client: null
};

const SERVER_VECTOR_KEYS = (Object.keys(initialTelemetryState) as (keyof TelemetryState)[]).filter(
	(k): k is Exclude<keyof TelemetryState, 'client'> => k !== 'client'
);

const CLIENT_VECTOR_KEYS = [
	'fingerprint',
	'clientHints',
	'connection',
	'resourceTiming',
	'webrtc',
	'networkJitter',
	'longTasks',
	'frameTiming',
	'layoutThrashing'
] as const;

export class TelemetryEngine {
	telemetry = $state<TelemetryState>({ ...initialTelemetryState });
	streamActive = $state(false);
	streamHaltedUnexpectedly = $state(false);
	networkLatency = $state<number | null>(null);
	errorMessage = $state<string | null>(null);
	autoPoll = $state(false);
	copied = $state(false);
	autoPollTimer: ReturnType<typeof setInterval> | null = null;

	readonly totalServerVectors = SERVER_VECTOR_KEYS.length;
	readonly totalClientVectors = CLIENT_VECTOR_KEYS.length;
	readonly totalVectors = SERVER_VECTOR_KEYS.length + CLIENT_VECTOR_KEYS.length;

	// Derived metrics
	serverVectorCount = $derived(SERVER_VECTOR_KEYS.filter((k) => this.telemetry[k] !== null).length);

	clientVectorCount = $derived(
		this.telemetry.client
			? CLIENT_VECTOR_KEYS.filter((k) => this.telemetry.client?.[k] !== null).length
			: 0
	);

	activeVectorCount = $derived(this.serverVectorCount + this.clientVectorCount);

	isMemoryPolluted = $derived(this.telemetry.contextLeak?.contextIsPolluted ?? false);

	/**
	 * Progressively executes client-side probes concurrently, streaming each metric
	 * into reactive state as soon as it resolves without blocking the server stream.
	 */
	async launchClientProbes() {
		const safeNavigator = typeof navigator !== 'undefined' ? navigator : null;

		const memory =
			typeof performance !== 'undefined' && 'memory' in performance
				? {
						heapLimitMb: Math.round(
							(performance as Performance & { memory: { jsHeapSizeLimit: number } }).memory
								.jsHeapSizeLimit /
								(1024 * 1024)
						)
					}
				: 'Restricted Sandboxed API';

		let hardwareCores: number | 'Unknown' = 'Unknown';
		try {
			if (safeNavigator && typeof safeNavigator.hardwareConcurrency === 'number') {
				hardwareCores = safeNavigator.hardwareConcurrency;
			}
		} catch {
			// Sandboxed
		}

		if (!this.telemetry.client) {
			this.telemetry.client = {
				cores: hardwareCores,
				gpu: { vendor: 'Loading...', renderer: 'Loading...' },
				memory,
				webGPU: safeNavigator ? 'gpu' in safeNavigator : false,
				userAgent: safeNavigator ? safeNavigator.userAgent : 'Unknown Context',
				fingerprint: {
					canvasHash: 'CANVAS-ID-PROBING',
					isFarblingDetected: false,
					adBlockerActive: false
				},
				audio: {
					audioHash: 'AUD-PROBING',
					isAudioFarbled: false
				},
				fonts: {
					fontSignature: 'FNT-PROBING',
					detectedFontCount: 0
				},
				clientHints: null,
				connection: null,
				resourceTiming: null,
				webrtc: null,
				networkJitter: null,
				longTasks: null,
				frameTiming: null,
				layoutThrashing: null
			};
		}

		// Fire all client probes in parallel with real-time progressive state updates
		await Promise.allSettled(
			CLIENT_PROBES.map(async (probe) => {
				try {
					const result = await probe.run();
					if (this.telemetry.client) {
						(this.telemetry.client as unknown as Record<string, unknown>)[probe.key] = result;
					}
				} catch (err) {
					console.error(`Client probe [${probe.name}] error:`, err);
				}
			})
		);
	}

	async launch() {
		if (this.streamActive) return;

		this.streamActive = true;
		this.streamHaltedUnexpectedly = false;
		this.errorMessage = null;

		// Reset server telemetry state
		this.telemetry = {
			...initialTelemetryState,
			client: this.telemetry.client
		};

		// 1. Launch client-side progressive probes in background
		void this.launchClientProbes();

		const startTime = performance.now();

		try {
			const response = await fetch('/api/diagnostics');
			if (!response.body) {
				throw new Error('Readable stream not supported by runtime gateway');
			}

			this.networkLatency = Math.round(performance.now() - startTime);

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (!line.trim()) continue;

					try {
						const rawJson = JSON.parse(line);
						const result = diagnosticStreamChunkSchema.safeParse(rawJson);

						if (!result.success) continue;
						const chunk: DiagnosticStreamChunk = result.data;

						if (chunk.type === 'panic') {
							throw new Error(chunk.data.message);
						}

						const targetKey = chunk.type as Exclude<DiagnosticChunkType, 'panic'>;
						(this.telemetry as unknown as Record<string, unknown>)[targetKey] = chunk.data;
					} catch (parseErr) {
						console.error('Chunk decode error bypassed:', parseErr);
					}
				}
			}
		} catch (e) {
			console.error('Telemetry Interruption Matrix:', e);
			this.streamHaltedUnexpectedly = true;
			this.errorMessage =
				e instanceof Error ? e.message : 'Isolate execution terminated unexpectedly';
		} finally {
			this.streamActive = false;
		}
	}

	toggleAutoPoll() {
		this.autoPoll = !this.autoPoll;
		if (this.autoPoll) {
			if (!this.streamActive) void this.launch();
			this.autoPollTimer = setInterval(() => {
				if (!this.streamActive) void this.launch();
			}, 3500);
		} else if (this.autoPollTimer) {
			clearInterval(this.autoPollTimer);
			this.autoPollTimer = null;
		}
	}

	exportTrace() {
		if (typeof window === 'undefined') return;

		const { client: clientForensics, ...serverVectors } = this.telemetry;

		const payload = {
			timestamp: new SvelteDate().toISOString(),
			suite: 'Edge Telemetry Bench v0.1.0',
			gatewayLatencyMs: this.networkLatency,
			platform: this.telemetry.cloudMetadata?.platform ?? 'Unknown',
			region: this.telemetry.cloudMetadata?.region ?? 'Unknown',
			serverVectors,
			clientForensics
		};

		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `edge-telemetry-trace-${new SvelteDate().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.info('Forensic Trace Exported', {
			description: 'Full vector JSON snapshot downloaded'
		});
	}

	async copySummary(): Promise<void> {
		if (typeof navigator === 'undefined' || !navigator.clipboard) return;

		const summary = [
			`### EDGE TELEMETRY BENCH REPORT [${new SvelteDate().toISOString()}]`,
			`- Platform: ${this.telemetry.cloudMetadata?.platform ?? 'N/A'} (${this.telemetry.cloudMetadata?.region ?? 'Local'})`,
			`- Isolate State: ${this.telemetry.isolateLifecycle?.isColdStart ? 'COLD BOOT' : 'WARM ISOLATE'} (Heap: ${this.telemetry.isolateLifecycle?.heapUsedMb ?? 0} MB)`,
			`- Spectre Attack Surface: ${this.telemetry.spectrePrimitives?.vulnerabilityProfile ?? 'N/A'} (SAB: ${this.telemetry.spectrePrimitives?.hasSharedArrayBuffer ? 'Exposed' : 'Protected'})`,
			`- Clock Precision: ${this.telemetry.clock?.minIncrementMs.toFixed(5) ?? 0} ms (${this.telemetry.clock?.estimatedMitigationLevel ?? 'N/A'})`,
			`- WebCrypto SHA-256: ${this.telemetry.cryptoBench?.sha256ThroughputMbSec ?? 0} MB/s | AES-GCM: ${this.telemetry.cryptoBench?.aesGcmThroughputMbSec ?? 0} MB/s`,
			`- Network Surveillance: Privacy Index ${this.telemetry.surveillance?.anonymityScore ?? 0}/100`,
			`- Client Concurrency: ${this.telemetry.client?.cores ?? 'N/A'} cores | Realtime FPS: ${this.telemetry.client?.frameTiming?.realtimeFps ?? 0}`
		].join('\n');

		try {
			await navigator.clipboard.writeText(summary);
			this.copied = true;
			setTimeout(() => {
				this.copied = false;
			}, 2000);
			toast.success('Telemetry Report Copied', {
				description: 'Markdown summary loaded to clipboard'
			});
		} catch (err) {
			console.error('Failed to copy telemetry summary:', err);
			toast.error('Clipboard Access Denied', {
				description: 'Failed to write diagnostic report to clipboard'
			});
		}
	}
}

export const telemetryEngine = new TelemetryEngine();
