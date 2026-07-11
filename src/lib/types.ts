// src/lib/types.ts
import { z } from 'zod';

// Sub-schemas for cleaner layout structure
const runtimeGlobalsSchema = z.strictObject({
	hasProcess: z.boolean(),
	hasDeno: z.boolean(),
	hasBun: z.boolean(),
	hasWebAssembly: z.boolean(),
	hasCaches: z.boolean()
});

// Master Discriminated Union Schema
export const diagnosticStreamChunkSchema = z.discriminatedUnion('type', [
	z.strictObject({
		type: z.literal('identity'),
		data: z.strictObject({
			spawnTime: z.number(),
			uptimeMs: z.number(),
			activations: z.number(),
			globalKeysCount: z.number(),
			runtimeGlobals: runtimeGlobalsSchema
		})
	}),
	z.strictObject({
		type: z.literal('contextLeak'),
		data: z.strictObject({
			contextIsPolluted: z.boolean(),
			previousMarkerDetected: z.string().nullable(),
			currentAssignedMarker: z.string()
		})
	}),
	z.strictObject({
		type: z.literal('jit'),
		data: z.strictObject({
			dynamicEvalAllowed: z.boolean(),
			evalDurationMs: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('entropy'),
		data: z.strictObject({
			entropyGenerationRateMbSec: z.number(),
			durationMs: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('disk'),
		data: z.strictObject({
			hasDiskAccess: z.boolean(),
			diskType: z.enum([
				'Persistent/Ephemeral Physical',
				'In-Memory Tmpfs',
				'Completely Sandboxed'
			]),
			writeLatencyMs: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('clock'),
		data: z.strictObject({
			minIncrementMs: z.number(),
			isCoarsened: z.boolean(),
			estimatedMitigationLevel: z.enum([
				'Absolute Lockdown',
				'Aggressive Spectre Guard',
				'Low/None'
			])
		})
	}),
	z.strictObject({
		type: z.literal('wasm'),
		data: z.strictObject({
			allowed: z.boolean(),
			compileDurationMs: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('memory'),
		data: z.strictObject({
			MaxSafeWasmAllocationMb: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('egress'),
		data: z.strictObject({
			outboundAccess: z.boolean(),
			pingMs: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('surveillance'),
		data: z.strictObject({
			clientIpHeaderLeaked: z.string(),
			proxyChainDetected: z.boolean(),
			requestFingerprintHash: z.string(),
			anonymityScore: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('concurrency'),
		data: z.strictObject({
			syncBurnOps: z.number(),
			eventLoopLagMs: z.number(),
			totalBurnDuration: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('panic'),
		data: z.strictObject({
			message: z.string()
		})
	})
]);

// Client Telemetry Schema
export const clientHardwareMetricsSchema = z.strictObject({
	cores: z.union([z.number(), z.literal('Unknown')]),
	gpu: z.strictObject({ vendor: z.string(), renderer: z.string() }),
	memory: z.union([
		z.strictObject({ heapLimitMb: z.number() }),
		z.literal('Restricted Sandboxed API')
	]),
	webGPU: z.boolean(),
	userAgent: z.string(),
	fingerprint: z.strictObject({
		canvasHash: z.string(),
		isFarblingDetected: z.boolean(),
		adBlockerActive: z.boolean()
	})
});

// Compile out the TypeScript types purely from the schemas
export type DiagnosticStreamChunk = z.infer<typeof diagnosticStreamChunkSchema>;
export type ClientHardwareMetrics = z.infer<typeof clientHardwareMetricsSchema>;

/**
 * DRY Type Mapper: Distributes the union and maps each 'type' literal
 * to its corresponding 'data' block format automatically.
 */
type ChunkDataMap = {
	[T in DiagnosticStreamChunk as T['type']]: T['data'];
};

// Now your explicit state types are cleanly derived by referencing the map:
export type IdentityChunk = ChunkDataMap['identity'];
export type ClockChunk = ChunkDataMap['clock'];
export type WasmChunk = ChunkDataMap['wasm'];
export type MemoryChunk = ChunkDataMap['memory'];
export type EgressChunk = ChunkDataMap['egress'];
export type ConcurrencyChunk = ChunkDataMap['concurrency'];
export type ContextLeakChunk = ChunkDataMap['contextLeak'];
export type JitChunk = ChunkDataMap['jit'];
export type EntropyChunk = ChunkDataMap['entropy'];
export type EphemeralDiskChunk = ChunkDataMap['disk'];
export type SurveillanceChunk = ChunkDataMap['surveillance'];
