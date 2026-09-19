// src/lib/client/probes/clientHints.probe.ts
import type { ClientProbe } from '../types';

interface NavigatorUAData {
	brands: Array<{ brand: string; version: string }>;
	mobile: boolean;
	platform: string;
	getHighEntropyValues?: (hints: string[]) => Promise<{
		architecture?: string;
		bitness?: string;
		model?: string;
		platformVersion?: string;
	}>;
}

export const clientHintsProbe: ClientProbe<'clientHints'> = {
	key: 'clientHints',
	name: 'Client Hints API (UA-CH)',
	async run() {
		if (typeof navigator === 'undefined') return null;

		const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
		if (!nav.userAgentData) {
			return {
				brands: [{ brand: 'Standard UserAgent', version: 'Legacy API' }],
				mobile: /Mobi|Android/i.test(navigator.userAgent),
				platform: navigator.platform || 'Unknown Platform',
				architecture: 'Restricted / Legacy',
				bitness: '64',
				model: 'Generic Hardware'
			};
		}

		const uaData = nav.userAgentData;
		let architecture = 'Standard x86/ARM';
		let bitness = '64';
		let model = '';

		if (typeof uaData.getHighEntropyValues === 'function') {
			try {
				const highEntropy = await uaData.getHighEntropyValues([
					'architecture',
					'bitness',
					'model',
					'platformVersion'
				]);
				if (highEntropy.architecture) architecture = highEntropy.architecture;
				if (highEntropy.bitness) bitness = highEntropy.bitness;
				if (highEntropy.model) model = highEntropy.model;
			} catch {
				// High entropy access denied or restricted by permissions policy
			}
		}

		return {
			brands: (uaData.brands || []).map((b) => ({ brand: b.brand, version: b.version })),
			mobile: Boolean(uaData.mobile),
			platform: uaData.platform || 'Unknown',
			architecture,
			bitness,
			model: model || 'Default Host Device'
		};
	}
};
