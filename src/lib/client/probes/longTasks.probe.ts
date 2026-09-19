// src/lib/client/probes/longTasks.probe.ts
import type { ClientProbe } from '../types';

export const longTasksProbe: ClientProbe<'longTasks'> = {
	key: 'longTasks',
	name: 'Long Tasks & Main-Thread Blocking',
	async run() {
		if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
			return {
				longTaskCount: 0,
				maxTaskDurationMs: 0,
				totalBlockingTimeMs: 0,
				observerSupported: false
			};
		}

		let longTaskCount = 0;
		let maxTaskDuration = 0;
		let totalBlockingTime = 0;

		try {
			// Check if longtask entry type is supported
			const supportedTypes = PerformanceObserver.supportedEntryTypes || [];
			if (!supportedTypes.includes('longtask')) {
				return {
					longTaskCount: 0,
					maxTaskDurationMs: 0,
					totalBlockingTimeMs: 0,
					observerSupported: false
				};
			}

			// Read any existing buffered longtask entries
			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					longTaskCount++;
					const duration = entry.duration;
					if (duration > maxTaskDuration) maxTaskDuration = duration;
					if (duration > 50) totalBlockingTime += duration - 50;
				}
			});

			observer.observe({ type: 'longtask', buffered: true });
			// Allow microtask tick to process buffered entries
			await new Promise<void>((r) => setTimeout(r, 60));
			observer.disconnect();
		} catch {
			// Longtask observation restricted
		}

		return {
			longTaskCount,
			maxTaskDurationMs: Math.round(maxTaskDuration * 10) / 10,
			totalBlockingTimeMs: Math.round(totalBlockingTime * 10) / 10,
			observerSupported: true
		};
	}
};
