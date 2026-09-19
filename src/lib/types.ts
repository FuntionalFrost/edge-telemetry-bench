// src/lib/types.ts
import { z } from 'zod';

// Sub-schemas for cleaner layout structure
export const runtimeGlobalsSchema = z.strictObject({
	hasProcess: z.boolean(),
	hasDeno: z.boolean(),
	hasBun: z.boolean(),
	hasWebAssembly: z.boolean(),
	hasCaches: z.boolean()
});

// Master Discriminated Union Schema for NDJSON stream chunks
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
		type: z.literal('cloudMetadata'),
		data: z.strictObject({
			platform: z.string(),
			region: z.string(),
			environment: z.string(),
			nodeVersion: z.string(),
			architecture: z.string()
		})
	}),
	z.strictObject({
		type: z.literal('isolateLifecycle'),
		data: z.strictObject({
			isColdStart: z.boolean(),
			instanceId: z.string(),
			invocationCount: z.number(),
			heapUsedMb: z.number(),
			heapTotalMb: z.number(),
			externalMemoryMb: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('spectrePrimitives'),
		data: z.strictObject({
			hasSharedArrayBuffer: z.boolean(),
			hasAtomics: z.boolean(),
			hasWasmSimd: z.boolean(),
			vulnerabilityProfile: z.enum(['Elevated Risk', 'Standard Isolated', 'Hardened'])
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
		type: z.literal('cacheJitter'),
		data: z.strictObject({
			l1L2AccessTimeNs: z.number(),
			varianceRatio: z.number(),
			noisyNeighborActivity: z.enum([
				'Nominal / Quiet',
				'Moderate Variance',
				'High Jitter / Contended'
			])
		})
	}),
	z.strictObject({
		type: z.literal('cryptoBench'),
		data: z.strictObject({
			sha256ThroughputMbSec: z.number(),
			aesGcmThroughputMbSec: z.number(),
			webCryptoSupported: z.boolean(),
			keyGenLatencyMs: z.number()
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
		type: z.literal('serializationStress'),
		data: z.strictObject({
			jsonThroughputMbSec: z.number(),
			structuredCloneLatencyMs: z.number(),
			payloadSizeBytes: z.number()
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
		type: z.literal('egress'),
		data: z.strictObject({
			outboundAccess: z.boolean(),
			pingMs: z.number()
		})
	}),
	z.strictObject({
		type: z.literal('multiEgressMatrix'),
		data: z.strictObject({
			cloudflareDnsMs: z.number(),
			googleDnsMs: z.number(),
			quad9DnsMs: z.number(),
			fastestResolver: z.string()
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

// Client Telemetry Sub-Schemas
export const clientHintsSchema = z.strictObject({
	brands: z.array(z.strictObject({ brand: z.string(), version: z.string() })),
	mobile: z.boolean(),
	platform: z.string(),
	architecture: z.string(),
	bitness: z.string(),
	model: z.string()
});

export const networkInfoSchema = z.strictObject({
	effectiveType: z.string(),
	downlinkMb: z.number(),
	rttMs: z.number(),
	saveData: z.boolean()
});

export const resourceTimingSchema = z.strictObject({
	subresourceCount: z.number(),
	avgDnsMs: z.number(),
	avgTcpMs: z.number(),
	avgTtfbMs: z.number(),
	totalTransferKb: z.number()
});

export const webrtcIceSchema = z.strictObject({
	iceGatheringDurationMs: z.number(),
	candidateCount: z.number(),
	candidateTypes: z.array(z.string()),
	protocols: z.array(z.string())
});

export const networkJitterSchema = z.strictObject({
	pingJitterMs: z.number(),
	minPingMs: z.number(),
	maxPingMs: z.number(),
	packetStability: z.enum(['Ultra Stable', 'Low Jitter', 'Moderate Variance', 'High Jitter'])
});

export const longTasksSchema = z.strictObject({
	longTaskCount: z.number(),
	maxTaskDurationMs: z.number(),
	totalBlockingTimeMs: z.number(),
	observerSupported: z.boolean()
});

export const frameTimingSchema = z.strictObject({
	estimatedRefreshRateHz: z.number(),
	realtimeFps: z.number(),
	droppedFrames: z.number(),
	frameJitterMs: z.number()
});

export const layoutThrashingSchema = z.strictObject({
	opsPerSec: z.number(),
	avgReflowMs: z.number(),
	totalBenchmarkMs: z.number()
});

// Master Client Hardware Metrics Schema
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
	}),
	audio: z.strictObject({
		audioHash: z.string(),
		isAudioFarbled: z.boolean()
	}),
	fonts: z.strictObject({
		fontSignature: z.string(),
		detectedFontCount: z.number()
	}),
	clientHints: clientHintsSchema.nullable(),
	connection: networkInfoSchema.nullable(),
	resourceTiming: resourceTimingSchema.nullable(),
	webrtc: webrtcIceSchema.nullable(),
	networkJitter: networkJitterSchema.nullable(),
	longTasks: longTasksSchema.nullable(),
	frameTiming: frameTimingSchema.nullable(),
	layoutThrashing: layoutThrashingSchema.nullable()
});

// Compile out the TypeScript types purely from the schemas
export type DiagnosticStreamChunk = z.infer<typeof diagnosticStreamChunkSchema>;
export type DiagnosticChunkType = DiagnosticStreamChunk['type'];
export type ClientHardwareMetrics = z.infer<typeof clientHardwareMetricsSchema>;

export type ClientHintsMetric = z.infer<typeof clientHintsSchema>;
export type NetworkInfoMetric = z.infer<typeof networkInfoSchema>;
export type ResourceTimingMetric = z.infer<typeof resourceTimingSchema>;
export type WebRtcIceMetric = z.infer<typeof webrtcIceSchema>;
export type NetworkJitterMetric = z.infer<typeof networkJitterSchema>;
export type LongTasksMetric = z.infer<typeof longTasksSchema>;
export type FrameTimingMetric = z.infer<typeof frameTimingSchema>;
export type LayoutThrashingMetric = z.infer<typeof layoutThrashingSchema>;

/**
 * DRY Type Mapper: Distributes the union and maps each 'type' literal
 * to its corresponding 'data' block format automatically.
 */
export type ChunkDataMap = {
	[T in DiagnosticStreamChunk as T['type']]: T['data'];
};

export type IdentityChunk = ChunkDataMap['identity'];
export type ContextLeakChunk = ChunkDataMap['contextLeak'];
export type CloudMetadataChunk = ChunkDataMap['cloudMetadata'];
export type IsolateLifecycleChunk = ChunkDataMap['isolateLifecycle'];
export type SpectrePrimitivesChunk = ChunkDataMap['spectrePrimitives'];
export type ClockChunk = ChunkDataMap['clock'];
export type CacheJitterChunk = ChunkDataMap['cacheJitter'];
export type CryptoBenchChunk = ChunkDataMap['cryptoBench'];
export type JitChunk = ChunkDataMap['jit'];
export type EntropyChunk = ChunkDataMap['entropy'];
export type WasmChunk = ChunkDataMap['wasm'];
export type MemoryChunk = ChunkDataMap['memory'];
export type SerializationStressChunk = ChunkDataMap['serializationStress'];
export type EphemeralDiskChunk = ChunkDataMap['disk'];
export type EgressChunk = ChunkDataMap['egress'];
export type MultiEgressMatrixChunk = ChunkDataMap['multiEgressMatrix'];
export type SurveillanceChunk = ChunkDataMap['surveillance'];
export type ConcurrencyChunk = ChunkDataMap['concurrency'];
