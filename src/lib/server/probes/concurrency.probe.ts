// src/lib/server/probes/concurrency.probe.ts
import type { DiagnosticProbe } from '../types';

export const concurrencyProbe: DiagnosticProbe<'concurrency'> = {
	type: 'concurrency',
	async run() {
		const loopStart = performance.now();
		let counter = 0;
		while (performance.now() - loopStart < 20) {
			counter++;
		}
		const loopEnd = performance.now();
		const macroStart = performance.now();
		await new Promise<void>((r) => setTimeout(r, 0));

		return {
			syncBurnOps: counter,
			eventLoopLagMs: Math.round((performance.now() - macroStart) * 1000) / 1000,
			totalBurnDuration: Math.round((loopEnd - loopStart) * 100) / 100
		};
	}
};
