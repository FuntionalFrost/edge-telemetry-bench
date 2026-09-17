// src/lib/server/probes/cacheJitter.probe.ts
import type { DiagnosticProbe } from '../types';

export const cacheJitterProbe: DiagnosticProbe<'cacheJitter'> = {
	type: 'cacheJitter',
	async run() {
		// Allocate small L1/L2 sized buffer (64KB) vs larger L3 (1MB) stride
		const bufferSize = 16 * 1024; // 16K elements = 64KB (L1/L2 range)
		const array = new Int32Array(bufferSize);
		for (let i = 0; i < bufferSize; i++) {
			array[i] = (i * 17) % bufferSize;
		}

		// Warm up CPU cache
		let index = 0;
		for (let i = 0; i < 5000; i++) {
			index = array[index]!;
		}

		// Measure multiple iterations
		const runs: number[] = [];
		const iterations = 5;
		const stepsPerRun = 20000;

		for (let r = 0; r < iterations; r++) {
			const start = performance.now();
			for (let i = 0; i < stepsPerRun; i++) {
				index = array[index]!;
			}
			const duration = performance.now() - start;
			runs.push(duration);
		}

		// Calculate mean access time per step in nanoseconds
		const avgDurationMs = runs.reduce((a, b) => a + b, 0) / runs.length;
		const nsPerAccess = (avgDurationMs * 1_000_000) / stepsPerRun;

		// Calculate variance
		const minRun = Math.min(...runs);
		const maxRun = Math.max(...runs);
		const varianceRatio = minRun > 0 ? (maxRun - minRun) / minRun : 0;

		let noisyNeighborActivity: 'Nominal / Quiet' | 'Moderate Variance' | 'High Jitter / Contended' =
			'Nominal / Quiet';
		if (varianceRatio > 0.6) {
			noisyNeighborActivity = 'High Jitter / Contended';
		} else if (varianceRatio > 0.25) {
			noisyNeighborActivity = 'Moderate Variance';
		}

		return {
			l1L2AccessTimeNs: Math.round(nsPerAccess * 100) / 100,
			varianceRatio: Math.round(varianceRatio * 1000) / 1000,
			noisyNeighborActivity
		};
	}
};
