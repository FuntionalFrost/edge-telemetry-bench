// src/lib/server/probes/serialization.probe.ts
import type { DiagnosticProbe } from '../types';

export const serializationProbe: DiagnosticProbe<'serializationStress'> = {
	type: 'serializationStress',
	async run() {
		// Construct synthetic nested object graph (~64KB)
		const baseNodes = 400;
		const testGraph: Record<string, unknown>[] = [];
		for (let i = 0; i < baseNodes; i++) {
			testGraph.push({
				id: `node_id_${i}`,
				nested: {
					vector: [i * 1.5, i * 2.5, i * 3.5],
					meta: { tag: `sec_tier_${i % 5}`, active: i % 2 === 0 }
				},
				fingerprint: `sig_${(i * 9999).toString(16)}`
			});
		}

		const sampleJson = JSON.stringify(testGraph);
		const payloadBytes = new TextEncoder().encode(sampleJson).byteLength;

		// 1. JSON Stringify / Parse throughput
		const jsonIterations = 10;
		const jsonStart = performance.now();
		for (let i = 0; i < jsonIterations; i++) {
			const str = JSON.stringify(testGraph);
			JSON.parse(str);
		}
		const jsonDurationSec = (performance.now() - jsonStart) / 1000;
		const totalProcessedMb = (payloadBytes * jsonIterations * 2) / (1024 * 1024);
		const jsonThroughputMbSec = jsonDurationSec > 0 ? totalProcessedMb / jsonDurationSec : 0;

		// 2. Structured Clone latency
		let structuredCloneLatencyMs = -1;
		if (typeof structuredClone === 'function') {
			const scStart = performance.now();
			for (let i = 0; i < 5; i++) {
				structuredClone(testGraph);
			}
			structuredCloneLatencyMs = (performance.now() - scStart) / 5;
		}

		return {
			jsonThroughputMbSec: Math.round(jsonThroughputMbSec * 10) / 10,
			structuredCloneLatencyMs: Math.round(structuredCloneLatencyMs * 100) / 100,
			payloadSizeBytes: payloadBytes
		};
	}
};
