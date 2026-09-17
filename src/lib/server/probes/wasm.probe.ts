// src/lib/server/probes/wasm.probe.ts
import type { DiagnosticProbe } from '../types';

export const wasmProbe: DiagnosticProbe<'wasm'> = {
	type: 'wasm',
	async run() {
		let wasmCompiled = false;
		let wasmCompileTime = -1;
		if (typeof WebAssembly !== 'undefined') {
			try {
				const start = performance.now();
				const minimalWasmBytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]);
				await WebAssembly.compile(minimalWasmBytes);
				wasmCompiled = true;
				wasmCompileTime = performance.now() - start;
			} catch {
				wasmCompiled = false;
			}
		}

		return {
			allowed: wasmCompiled,
			compileDurationMs: wasmCompileTime
		};
	}
};
