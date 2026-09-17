// src/lib/server/probes/index.ts
import type { DiagnosticChunkType } from '$lib/types';
import type { DiagnosticProbe } from '../types';

import { identityProbe } from './identity.probe';
import { contextLeakProbe } from './contextLeak.probe';
import { cloudMetadataProbe } from './cloudMetadata.probe';
import { isolateLifecycleProbe } from './isolateLifecycle.probe';
import { spectreProbe } from './spectre.probe';
import { clockProbe } from './clock.probe';
import { cacheJitterProbe } from './cacheJitter.probe';
import { cryptoBenchProbe } from './cryptoBench.probe';
import { jitProbe } from './jit.probe';
import { entropyProbe } from './entropy.probe';
import { wasmProbe } from './wasm.probe';
import { memoryProbe } from './memory.probe';
import { serializationProbe } from './serialization.probe';
import { diskProbe } from './disk.probe';
import { egressProbe } from './egress.probe';
import { multiEgressProbe } from './multiEgress.probe';
import { surveillanceProbe } from './surveillance.probe';
import { concurrencyProbe } from './concurrency.probe';

// Ordered sequence of telemetry interrogations executed during NDJSON stream
export const PROBE_REGISTRY: DiagnosticProbe<Exclude<DiagnosticChunkType, 'panic'>>[] = [
	identityProbe,
	contextLeakProbe,
	cloudMetadataProbe,
	isolateLifecycleProbe,
	spectreProbe,
	clockProbe,
	cacheJitterProbe,
	cryptoBenchProbe,
	jitProbe,
	entropyProbe,
	wasmProbe,
	memoryProbe,
	serializationProbe,
	diskProbe,
	egressProbe,
	multiEgressProbe,
	surveillanceProbe,
	concurrencyProbe
];
