// src/lib/client/telemetry.svelte.ts
import { gatherClientMetrics } from '$lib/client/hardware';
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
} from '$lib/types';
import { diagnosticStreamChunkSchema } from '$lib/types';

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

export class TelemetryEngine {
	telemetry = $state<TelemetryState>({ ...initialTelemetryState });
	streamActive = $state(false);
	streamHaltedUnexpectedly = $state(false);
	networkLatency = $state<number | null>(null);
	errorMessage = $state<string | null>(null);

	// Derived metrics
	activeVectorCount = $derived(
		Object.entries(this.telemetry).filter(([k, v]) => k !== 'client' && v !== null).length
	);

	isMemoryPolluted = $derived(this.telemetry.contextLeak?.contextIsPolluted ?? false);

	async launch() {
		if (this.streamActive) return;

		this.streamActive = true;
		this.streamHaltedUnexpectedly = false;
		this.errorMessage = null;

		// Reset state
		this.telemetry = {
			...initialTelemetryState,
			client: this.telemetry.client // preserve client metrics if already gathered
		};

		// 1. Gather client hardware metrics in parallel if missing
		if (!this.telemetry.client) {
			gatherClientMetrics()
				.then((metrics) => {
					this.telemetry.client = metrics;
				})
				.catch((err) => console.error('Failed gathering client hardware metrics:', err));
		}

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
}

export const telemetryEngine = new TelemetryEngine();
