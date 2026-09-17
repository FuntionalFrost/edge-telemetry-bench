// src/lib/server/probes/spectre.probe.ts
import type { DiagnosticProbe } from '../types';

export const spectreProbe: DiagnosticProbe<'spectrePrimitives'> = {
	type: 'spectrePrimitives',
	async run() {
		const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
		const hasAtomics = typeof Atomics !== 'undefined' && typeof Atomics.wait === 'function';

		let hasWasmSimd = false;
		if (typeof WebAssembly !== 'undefined') {
			try {
				// Minimal WASM SIMD module binary (v128.const)
				const simdBytes = new Uint8Array([
					0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
					0x03, 0x02, 0x01, 0x00, 0x0a, 0x15, 0x01, 0x13, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0b
				]);
				hasWasmSimd = WebAssembly.validate(simdBytes);
			} catch {
				hasWasmSimd = false;
			}
		}

		let vulnerabilityProfile: 'Elevated Risk' | 'Standard Isolated' | 'Hardened' =
			'Standard Isolated';
		if (hasSharedArrayBuffer && hasAtomics) {
			vulnerabilityProfile = 'Elevated Risk';
		} else if (!hasSharedArrayBuffer && !hasAtomics) {
			vulnerabilityProfile = 'Hardened';
		}

		return {
			hasSharedArrayBuffer,
			hasAtomics,
			hasWasmSimd,
			vulnerabilityProfile
		};
	}
};
