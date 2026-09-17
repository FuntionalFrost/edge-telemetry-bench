// src/lib/server/probes/disk.probe.ts
import type { DiagnosticProbe } from '../types';

export const diskProbe: DiagnosticProbe<'disk'> = {
	type: 'disk',
	async run() {
		let hasDiskAccess = false;
		let diskType: 'Persistent/Ephemeral Physical' | 'In-Memory Tmpfs' | 'Completely Sandboxed' =
			'Completely Sandboxed';
		let writeLatency = -1;

		if (typeof process !== 'undefined' && process.versions?.node) {
			try {
				const fs = await import('fs/promises');
				const path = await import('path');
				const os = await import('os');

				const tempDir = os.tmpdir();
				const testFilePath = path.join(
					tempDir,
					`probe_${Date.now()}_${Math.random().toString(36).slice(2)}.log`
				);
				const largePayload = '0'.repeat(1024 * 256);

				const dStart = performance.now();
				await fs.writeFile(testFilePath, largePayload);
				await fs.unlink(testFilePath);
				writeLatency = performance.now() - dStart;
				hasDiskAccess = true;
				diskType = writeLatency < 0.8 ? 'In-Memory Tmpfs' : 'Persistent/Ephemeral Physical';
			} catch {
				hasDiskAccess = false;
			}
		}

		return {
			hasDiskAccess,
			diskType,
			writeLatencyMs: writeLatency > 0 ? Math.round(writeLatency * 100) / 100 : writeLatency
		};
	}
};
