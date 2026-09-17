// src/lib/server/probes/contextLeak.probe.ts
import type { DiagnosticProbe } from '../types';

export const contextLeakProbe: DiagnosticProbe<'contextLeak'> = {
	type: 'contextLeak',
	async run() {
		const targetGlobal = globalThis as unknown as { __INTERROGATION_MARKER?: string };
		const detectedMarker = targetGlobal.__INTERROGATION_MARKER || null;
		const isPolluted = detectedMarker !== null;
		const newMarker = `node_token_0x${Math.random().toString(16).slice(2, 10)}`;
		targetGlobal.__INTERROGATION_MARKER = newMarker;

		return {
			contextIsPolluted: isPolluted,
			previousMarkerDetected: detectedMarker,
			currentAssignedMarker: newMarker
		};
	}
};
