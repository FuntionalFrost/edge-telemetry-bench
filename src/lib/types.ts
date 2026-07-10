export interface IdentityChunk {
	spawnTime: number;
	uptimeMs: number;
	activations: number;
	globalKeysCount: number;
	runtimeGlobals: {
		hasProcess: boolean;
		hasDeno: boolean;
		hasBun: boolean;
		hasWebAssembly: boolean;
		hasCaches: boolean;
	};
}

export interface ClockChunk {
	minIncrementMs: number;
	isCoarsened: boolean;
	estimatedMitigationLevel: 'Aggressive Spectre Guard' | 'Low/None' | 'Absolute Edge Lockdown';
}

export interface WasmChunk {
	allowed: boolean;
	compileDurationMs: number;
}

export interface MemoryChunk {
	MaxSafeWasmAllocationMb: number;
}

export interface EgressChunk {
	outboundAccess: boolean;
	pingMs: number;
}

export interface ConcurrencyChunk {
	syncBurnOps: number;
	eventLoopLagMs: number;
	totalBurnDuration: number;
}

export interface ContextLeakChunk {
	contextIsPolluted: boolean;
	previousMarkerDetected: string | null;
	currentAssignedMarker: string;
}

export interface JitChunk {
	dynamicEvalAllowed: boolean;
	evalDurationMs: number;
}

export interface EntropyChunk {
	entropyGenerationRateMbSec: number;
	durationMs: number;
}

export interface EphemeralDiskChunk {
	hasDiskAccess: boolean;
	diskType: 'Persistent/Ephemeral Physical' | 'In-Memory Tmpfs' | 'Completely Sandboxed';
	writeLatencyMs: number;
}

// --- NEW PRIVACY & SURVEILLANCE CONTRACT ---
export interface SurveillanceChunk {
	clientIpHeaderLeaked: string;
	proxyChainDetected: boolean;
	requestFingerprintHash: string;
	anonymityScore: number;
}

export type DiagnosticStreamChunk =
	| { type: 'identity'; data: IdentityChunk }
	| { type: 'clock'; data: ClockChunk }
	| { type: 'wasm'; data: WasmChunk }
	| { type: 'memory'; data: MemoryChunk }
	| { type: 'egress'; data: EgressChunk }
	| { type: 'concurrency'; data: ConcurrencyChunk }
	| { type: 'contextLeak'; data: ContextLeakChunk }
	| { type: 'jit'; data: JitChunk }
	| { type: 'entropy'; data: EntropyChunk }
	| { type: 'disk'; data: EphemeralDiskChunk }
	| { type: 'surveillance'; data: SurveillanceChunk }
	| { type: 'panic'; data: { message: string } };

export interface ClientHardwareMetrics {
	cores: number | 'Unknown';
	gpu: { vendor: string; renderer: string };
	memory: { heapLimitMb: number } | string;
	webGPU: boolean;
	userAgent: string;
	fingerprint: {
		canvasHash: string;
		isFarblingDetected: boolean;
		adBlockerActive: boolean;
	};
}
