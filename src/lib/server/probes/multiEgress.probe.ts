// src/lib/server/probes/multiEgress.probe.ts
import type { DiagnosticProbe } from '../types';

export const multiEgressProbe: DiagnosticProbe<'multiEgressMatrix'> = {
	type: 'multiEgressMatrix',
	async run() {
		const pingTarget = async (url: string): Promise<number> => {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 350);
			const start = performance.now();
			try {
				await fetch(url, { method: 'HEAD', signal: controller.signal });
				return Math.round((performance.now() - start) * 10) / 10;
			} catch {
				return -1;
			} finally {
				clearTimeout(timeoutId);
			}
		};

		const [cf, google, quad9] = await Promise.all([
			pingTarget('https://1.1.1.1'),
			pingTarget('https://8.8.8.8'),
			pingTarget('https://9.9.9.9')
		]);

		const validPings: { name: string; latency: number }[] = [];
		if (cf > 0) validPings.push({ name: 'Cloudflare (1.1.1.1)', latency: cf });
		if (google > 0) validPings.push({ name: 'Google (8.8.8.8)', latency: google });
		if (quad9 > 0) validPings.push({ name: 'Quad9 (9.9.9.9)', latency: quad9 });

		validPings.sort((a, b) => a.latency - b.latency);
		const fastestResolver =
			validPings.length > 0
				? `${validPings[0]!.name} (${validPings[0]!.latency}ms)`
				: 'All Probes Filtered';

		return {
			cloudflareDnsMs: cf,
			googleDnsMs: google,
			quad9DnsMs: quad9,
			fastestResolver
		};
	}
};
