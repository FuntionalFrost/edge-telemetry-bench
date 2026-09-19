// src/lib/server/probes/cryptoBench.probe.ts
import type { DiagnosticProbe } from '../types';

export const cryptoBenchProbe: DiagnosticProbe<'cryptoBench'> = {
	type: 'cryptoBench',
	async run() {
		const webCryptoSupported =
			typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
		if (!webCryptoSupported) {
			return {
				sha256ThroughputMbSec: 0,
				aesGcmThroughputMbSec: 0,
				webCryptoSupported: false,
				keyGenLatencyMs: -1
			};
		}

		try {
			// 1. Key Generation Latency Benchmark
			const keyStart = performance.now();
			const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
				'encrypt',
				'decrypt'
			]);
			const keyGenLatencyMs = performance.now() - keyStart;

			// 2. SHA-256 Throughput Benchmark (64KB payload per W3C getRandomValues quota)
			const payloadSize = 64 * 1024; // 64KB (W3C standard max for getRandomValues)
			const payload = new Uint8Array(payloadSize);
			crypto.getRandomValues(payload);

			const iterations = 16; // 16 * 64KB = 1MB benchmark
			const shaStart = performance.now();
			for (let i = 0; i < iterations; i++) {
				await crypto.subtle.digest('SHA-256', payload);
			}
			const shaDurationSec = (performance.now() - shaStart) / 1000;
			const totalMb = (payloadSize * iterations) / (1024 * 1024);
			const sha256ThroughputMbSec = shaDurationSec > 0 ? totalMb / shaDurationSec : 0;

			// 3. AES-GCM 256-bit Encryption Throughput Benchmark
			const iv = crypto.getRandomValues(new Uint8Array(12));
			const aesStart = performance.now();
			for (let i = 0; i < iterations; i++) {
				await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, payload);
			}
			const aesDurationSec = (performance.now() - aesStart) / 1000;
			const aesGcmThroughputMbSec = aesDurationSec > 0 ? totalMb / aesDurationSec : 0;

			return {
				sha256ThroughputMbSec: Math.round(sha256ThroughputMbSec * 10) / 10,
				aesGcmThroughputMbSec: Math.round(aesGcmThroughputMbSec * 10) / 10,
				webCryptoSupported: true,
				keyGenLatencyMs: Math.round(keyGenLatencyMs * 100) / 100
			};
		} catch (e) {
			console.error('Crypto bench error:', e);
			return {
				sha256ThroughputMbSec: 0,
				aesGcmThroughputMbSec: 0,
				webCryptoSupported: true,
				keyGenLatencyMs: -1
			};
		}
	}
};
