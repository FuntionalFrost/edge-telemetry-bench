// src/lib/client/probes/resourceTiming.probe.ts
import type { ClientProbe } from '../types';

export const resourceTimingProbe: ClientProbe<'resourceTiming'> = {
	key: 'resourceTiming',
	name: 'Resource Timing API',
	async run() {
		if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
			return null;
		}

		const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
		if (!entries || entries.length === 0) {
			return {
				subresourceCount: 0,
				avgDnsMs: 0,
				avgTcpMs: 0,
				avgTtfbMs: 0,
				totalTransferKb: 0
			};
		}

		let totalDns = 0;
		let totalTcp = 0;
		let totalTtfb = 0;
		let totalBytes = 0;
		let validEntries = 0;

		for (const entry of entries) {
			const dns = entry.domainLookupEnd - entry.domainLookupStart;
			const tcp = entry.connectEnd - entry.connectStart;
			const ttfb =
				entry.responseStart > entry.requestStart ? entry.responseStart - entry.requestStart : 0;
			const size = entry.transferSize || entry.encodedBodySize || 0;

			if (dns >= 0) totalDns += dns;
			if (tcp >= 0) totalTcp += tcp;
			if (ttfb >= 0) totalTtfb += ttfb;
			totalBytes += size;
			validEntries++;
		}

		const count = validEntries || 1;

		return {
			subresourceCount: entries.length,
			avgDnsMs: Math.round((totalDns / count) * 100) / 100,
			avgTcpMs: Math.round((totalTcp / count) * 100) / 100,
			avgTtfbMs: Math.round((totalTtfb / count) * 100) / 100,
			totalTransferKb: Math.round((totalBytes / 1024) * 10) / 10
		};
	}
};
