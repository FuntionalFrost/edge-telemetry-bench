// src/lib/server/probes/clock.probe.ts
import type { DiagnosticProbe } from '../types';

export const clockProbe: DiagnosticProbe<'clock'> = {
	type: 'clock',
	async run() {
		let lastTime = performance.now();
		const measurements: number[] = [];
		for (let i = 0; i < 500; i++) {
			const now = performance.now();
			if (now !== lastTime) {
				measurements.push(now - lastTime);
				lastTime = now;
			}
		}
		const minDetectedIncrement = measurements.length ? Math.min(...measurements) : 0;
		const isCoarsened = minDetectedIncrement >= 0.1 || minDetectedIncrement === 0;

		const estimatedMitigationLevel: 'Absolute Lockdown' | 'Aggressive Spectre Guard' | 'Low/None' =
			minDetectedIncrement === 0
				? 'Absolute Lockdown'
				: minDetectedIncrement >= 0.1
					? 'Aggressive Spectre Guard'
					: 'Low/None';

		return {
			minIncrementMs: minDetectedIncrement,
			isCoarsened,
			estimatedMitigationLevel
		};
	}
};
