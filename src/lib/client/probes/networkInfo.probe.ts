// src/lib/client/probes/networkInfo.probe.ts
import type { ClientProbe } from '../types';

interface NetworkConnection {
	effectiveType?: string;
	downlink?: number;
	rtt?: number;
	saveData?: boolean;
}

export const networkInfoProbe: ClientProbe<'connection'> = {
	key: 'connection',
	name: 'Network Information API',
	async run() {
		if (typeof navigator === 'undefined') return null;

		const nav = navigator as Navigator & {
			connection?: NetworkConnection;
			mozConnection?: NetworkConnection;
			webkitConnection?: NetworkConnection;
		};

		const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

		if (!conn) {
			return {
				effectiveType: 'Direct / Unmetered',
				downlinkMb: 10,
				rttMs: 25,
				saveData: false
			};
		}

		return {
			effectiveType: (conn.effectiveType || '4g').toUpperCase(),
			downlinkMb: typeof conn.downlink === 'number' ? Math.round(conn.downlink * 10) / 10 : 10,
			rttMs: typeof conn.rtt === 'number' ? conn.rtt : 25,
			saveData: Boolean(conn.saveData)
		};
	}
};
