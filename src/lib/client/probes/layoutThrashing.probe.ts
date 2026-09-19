// src/lib/client/probes/layoutThrashing.probe.ts
import type { ClientProbe } from '../types';

export const layoutThrashingProbe: ClientProbe<'layoutThrashing'> = {
	key: 'layoutThrashing',
	name: 'DOM Layout Thrashing Benchmark',
	async run() {
		if (typeof document === 'undefined') {
			return {
				opsPerSec: 0,
				avgReflowMs: 0,
				totalBenchmarkMs: 0
			};
		}

		// Create isolated offscreen container
		const container = document.createElement('div');
		container.style.position = 'fixed';
		container.style.top = '-9999px';
		container.style.left = '-9999px';
		container.style.width = '300px';
		container.style.height = '300px';
		container.style.visibility = 'hidden';

		const element = document.createElement('div');
		element.style.width = '50px';
		element.style.height = '50px';
		element.style.backgroundColor = 'red';
		container.appendChild(element);
		document.body.appendChild(container);

		const iterations = 80;
		const start = performance.now();
		let forcedReadSum = 0;

		try {
			for (let i = 0; i < iterations; i++) {
				// Forced write followed immediately by forced layout read = Layout Thrashing
				element.style.width = `${50 + (i % 20)}px`;
				element.style.paddingLeft = `${i % 5}px`;
				forcedReadSum += element.offsetWidth + element.clientHeight;
			}
		} finally {
			// Clean up container
			if (container.parentNode) {
				container.parentNode.removeChild(container);
			}
		}

		// Prevent compiler dead-code elimination
		void forcedReadSum;

		const totalDuration = performance.now() - start;
		const avgReflow = totalDuration / iterations;
		const opsPerSec = totalDuration > 0 ? (iterations / totalDuration) * 1000 : 0;

		return {
			opsPerSec: Math.round(opsPerSec),
			avgReflowMs: Math.round(avgReflow * 1000) / 1000,
			totalBenchmarkMs: Math.round(totalDuration * 10) / 10
		};
	}
};
