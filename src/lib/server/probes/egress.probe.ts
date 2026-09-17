// src/lib/server/probes/egress.probe.ts
import type { DiagnosticProbe } from '../types';

export const egressProbe: DiagnosticProbe<'egress'> = {
	type: 'egress',
	async run() {
		let internetAccess = false;
		let egressLatencyMs = -1;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 400);

		try {
			const netStart = performance.now();
			await fetch('https://1.1.1.1', { method: 'HEAD', signal: controller.signal });
			internetAccess = true;
			egressLatencyMs = performance.now() - netStart;
		} catch {
			// Internet access blocked or timed out
		} finally {
			clearTimeout(timeoutId);
		}

		return {
			outboundAccess: internetAccess,
			pingMs: egressLatencyMs > 0 ? Math.round(egressLatencyMs * 10) / 10 : egressLatencyMs
		};
	}
};
