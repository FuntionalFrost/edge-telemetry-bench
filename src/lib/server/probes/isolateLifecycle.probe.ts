// src/lib/server/probes/isolateLifecycle.probe.ts
import type { DiagnosticProbe } from '../types';

const instanceId = `iso_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
let invocationCount = 0;

export const isolateLifecycleProbe: DiagnosticProbe<'isolateLifecycle'> = {
	type: 'isolateLifecycle',
	async run() {
		invocationCount++;
		const isColdStart = invocationCount === 1;

		let heapUsedMb = 0;
		let heapTotalMb = 0;
		let externalMemoryMb = 0;

		if (typeof process !== 'undefined' && typeof process.memoryUsage === 'function') {
			const mem = process.memoryUsage();
			heapUsedMb = Math.round((mem.heapUsed / (1024 * 1024)) * 100) / 100;
			heapTotalMb = Math.round((mem.heapTotal / (1024 * 1024)) * 100) / 100;
			externalMemoryMb = Math.round((mem.external / (1024 * 1024)) * 100) / 100;
		} else if (typeof performance !== 'undefined' && 'memory' in performance) {
			const mem = (
				performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }
			).memory;
			heapUsedMb = Math.round((mem.usedJSHeapSize / (1024 * 1024)) * 100) / 100;
			heapTotalMb = Math.round((mem.totalJSHeapSize / (1024 * 1024)) * 100) / 100;
		}

		return {
			isColdStart,
			instanceId,
			invocationCount,
			heapUsedMb,
			heapTotalMb,
			externalMemoryMb
		};
	}
};
