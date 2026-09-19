// src/lib/client/probes/frameTiming.probe.ts
import type { ClientProbe } from '../types';

export const frameTimingProbe: ClientProbe<'frameTiming'> = {
	key: 'frameTiming',
	name: 'rAF Refresh Rate & Frame Drops',
	async run() {
		if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
			return {
				estimatedRefreshRateHz: 60,
				realtimeFps: 60,
				droppedFrames: 0,
				frameJitterMs: 0
			};
		}

		return new Promise((resolve) => {
			const targetFrames = 40;
			const timestamps: number[] = [];

			const sampleFrame = (now: number) => {
				timestamps.push(now);
				if (timestamps.length < targetFrames) {
					requestAnimationFrame(sampleFrame);
				} else {
					// Calculate frame deltas
					const deltas: number[] = [];
					for (let i = 1; i < timestamps.length; i++) {
						deltas.push(timestamps[i]! - timestamps[i - 1]!);
					}

					const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
					const rawFps = avgDelta > 0 ? 1000 / avgDelta : 60;

					// Infer target display refresh rate
					let estimatedHz: number;
					if (rawFps > 200) estimatedHz = 240;
					else if (rawFps > 130) estimatedHz = 144;
					else if (rawFps > 100) estimatedHz = 120;
					else if (rawFps > 80) estimatedHz = 90;
					else if (rawFps > 45) estimatedHz = 60;
					else estimatedHz = 30;

					const targetInterval = 1000 / estimatedHz;
					let droppedFrames = 0;
					let jitterSum = 0;

					for (const delta of deltas) {
						if (delta > targetInterval * 1.5) {
							droppedFrames += Math.round(delta / targetInterval) - 1;
						}
						jitterSum += Math.abs(delta - targetInterval);
					}

					const frameJitter = deltas.length > 0 ? jitterSum / deltas.length : 0;

					resolve({
						estimatedRefreshRateHz: estimatedHz,
						realtimeFps: Math.round(rawFps * 10) / 10,
						droppedFrames,
						frameJitterMs: Math.round(frameJitter * 100) / 100
					});
				}
			};

			requestAnimationFrame(sampleFrame);
		});
	}
};
