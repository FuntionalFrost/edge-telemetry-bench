// src/lib/server/probes/memory.probe.ts
import type { DiagnosticProbe } from '../types';

export const memoryProbe: DiagnosticProbe<'memory'> = {
	type: 'memory',
	async run() {
		let allocatedMegaBytes = 0;
		if (typeof WebAssembly !== 'undefined') {
			try {
				const wasmMemory = new WebAssembly.Memory({ initial: 256 });
				allocatedMegaBytes = wasmMemory.buffer.byteLength / (1024 * 1024);
			} catch {
				allocatedMegaBytes = 0;
			}
		}

		return {
			MaxSafeWasmAllocationMb: allocatedMegaBytes
		};
	}
};
