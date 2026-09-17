// src/lib/server/probes/surveillance.probe.ts
import type { DiagnosticProbe } from '../types';

export const surveillanceProbe: DiagnosticProbe<'surveillance'> = {
	type: 'surveillance',
	async run({ request }) {
		const headers = request.headers;
		const clientIp =
			headers.get('cf-connecting-ip') ||
			headers.get('x-real-ip') ||
			headers.get('x-forwarded-for') ||
			headers.get('true-client-ip') ||
			'Direct Loopback';
		const hasProxyHeaders =
			headers.has('via') ||
			headers.has('forwarded') ||
			headers.has('cf-ray') ||
			headers.has('x-vercel-id') ||
			(headers.get('x-forwarded-for')?.split(',') ?? []).length > 1;

		let baseAnonymity = 100;
		if (hasProxyHeaders) baseAnonymity -= 30;
		if (headers.has('sec-ch-ua')) baseAnonymity -= 10;

		const hashInput = `${clientIp}-${headers.get('user-agent')}`;
		let hash = 0;
		for (let i = 0; i < hashInput.length; i++) {
			hash = (hash << 5) - hash + hashInput.charCodeAt(i);
			hash |= 0;
		}

		return {
			clientIpHeaderLeaked: clientIp.split(',')[0]!.trim(),
			proxyChainDetected: hasProxyHeaders,
			requestFingerprintHash: `REQ-SIG-${Math.abs(hash).toString(16).toUpperCase()}`,
			anonymityScore: baseAnonymity
		};
	}
};
