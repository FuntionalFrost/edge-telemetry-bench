// Individual Stream Chunk Payloads
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
	estimatedMitigationLevel: 'Aggressive Spectre Guard' | 'Low/None';
}

export interface WasmChunk {
	allowed: boolean;
	compileDurationMs: number;
}

export interface MemoryEgressChunk {
	MaxSafeWasmAllocationMb: number;
	outboundAccess?: boolean;
	pingMs?: number;
}

export interface ConcurrencyChunk {
	syncBurnOps: number;
	eventLoopLagMs: number;
	totalBurnDuration: number;
}

// Discriminated Union for Server Stream Processing
export type DiagnosticStreamChunk =
	| { type: 'identity'; data: IdentityChunk }
	| { type: 'clock'; data: ClockChunk }
	| { type: 'wasm'; data: WasmChunk }
	| { type: 'memory'; data: MemoryEgressChunk }
	| { type: 'egress'; data: MemoryEgressChunk }
	| { type: 'concurrency'; data: ConcurrencyChunk }
	| { type: 'panic'; data: { message: string } };

// Client Hardware Profile
export interface ClientHardwareMetrics {
	cores: number | 'Unknown';
	gpu: {
		vendor: string;
		renderer: string;
	};
	memory: { heapLimitMb: number } | string;
	webGPU: boolean;
	userAgent: string;
}
