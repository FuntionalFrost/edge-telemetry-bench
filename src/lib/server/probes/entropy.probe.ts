// src/lib/server/probes/entropy.probe.ts
import type { DiagnosticProbe } from '../types';

export const entropyProbe: DiagnosticProbe<'entropy'> = {
	type: 'entropy',
	async run() {
		try {
			const entropyStart = performance.now();
			const safeQuotaLimit = 64 * 1024;
			const entropyBuffer = new Uint8Array(safeQuotaLimit);

			if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
				crypto.getRandomValues(entropyBuffer);
			}

			const entropyDuration = performance.now() - entropyStart;
			const megabytesGenerated = safeQuotaLimit / (1024 * 1024);
			const rate = megabytesGenerated / (entropyDuration / 1000);

			return {
				entropyGenerationRateMbSec: isFinite(rate) && rate > 0 ? rate : 0,
				durationMs: entropyDuration
			};
		} catch {
			return {
				entropyGenerationRateMbSec: 0,
				durationMs: 0
			};
		}
	}
};
