// src/lib/client/hardware.ts
import type { ClientHardwareMetrics } from '$lib/types';
import { CLIENT_PROBES } from './probes';

/**
 * Executes all client probes in parallel and compiles the full ClientHardwareMetrics payload.
 */
export async function gatherClientMetrics(): Promise<ClientHardwareMetrics> {
	const safeNavigator = typeof navigator !== 'undefined' ? navigator : null;

	const memory =
		typeof performance !== 'undefined' && 'memory' in performance
			? {
					heapLimitMb: Math.round(
						(performance as Performance & { memory: { jsHeapSizeLimit: number } }).memory
							.jsHeapSizeLimit /
							(1024 * 1024)
					)
				}
			: 'Restricted Sandboxed API';

	let hardwareCores: number | 'Unknown' = 'Unknown';
	try {
		if (safeNavigator && typeof safeNavigator.hardwareConcurrency === 'number') {
			hardwareCores = safeNavigator.hardwareConcurrency;
		}
	} catch {
		// Sandboxed
	}

	const baseMetrics: ClientHardwareMetrics = {
		cores: hardwareCores,
		gpu: { vendor: 'Unknown', renderer: 'Unknown' },
		memory,
		webGPU: safeNavigator ? 'gpu' in safeNavigator : false,
		userAgent: safeNavigator ? safeNavigator.userAgent : 'Unknown Context',
		fingerprint: {
			canvasHash: 'CANVAS-ID-UNPROBED',
			isFarblingDetected: false,
			adBlockerActive: false
		},
		audio: {
			audioHash: 'AUD-UNPROBED',
			isAudioFarbled: false
		},
		fonts: {
			fontSignature: 'FNT-UNPROBED',
			detectedFontCount: 0
		},
		clientHints: null,
		connection: null,
		resourceTiming: null,
		webrtc: null,
		networkJitter: null,
		longTasks: null,
		frameTiming: null,
		layoutThrashing: null
	};

	await Promise.allSettled(
		CLIENT_PROBES.map(async (probe) => {
			try {
				const result = await probe.run();
				(baseMetrics as Record<string, unknown>)[probe.key] = result;
			} catch (err) {
				console.error(`Client probe [${probe.name}] error:`, err);
			}
		})
	);

	return baseMetrics;
}
