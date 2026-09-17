// src/lib/server/probes/identity.probe.ts
import type { DiagnosticProbe } from '../types';

const isolateSpawnTime = performance.now();
const isolateSpawnDateEpoch = Date.now();
let activationCount = 0;

export const identityProbe: DiagnosticProbe<'identity'> = {
	type: 'identity',
	async run() {
		activationCount++;
		return {
			spawnTime: isolateSpawnDateEpoch,
			uptimeMs: performance.now() - isolateSpawnTime,
			activations: activationCount,
			globalKeysCount: Object.getOwnPropertyNames(globalThis).length,
			runtimeGlobals: {
				hasProcess: typeof process !== 'undefined',
				hasDeno: 'Deno' in globalThis,
				hasBun: 'Bun' in globalThis,
				hasWebAssembly: typeof WebAssembly !== 'undefined',
				hasCaches: 'caches' in globalThis
			}
		};
	}
};
