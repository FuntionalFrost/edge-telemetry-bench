// src/lib/server/probes/jit.probe.ts
import type { DiagnosticProbe } from '../types';

export const jitProbe: DiagnosticProbe<'jit'> = {
	type: 'jit',
	async run() {
		let evalAllowed = false;
		let evalTime = -1;
		try {
			const evalStart = performance.now();
			const dynamicFunc = new Function('a', 'b', 'return a * b') as (
				a: number,
				b: number
			) => number;
			if (dynamicFunc(6, 7) === 42) {
				evalAllowed = true;
				evalTime = performance.now() - evalStart;
			}
		} catch {
			evalAllowed = false;
		}

		return {
			dynamicEvalAllowed: evalAllowed,
			evalDurationMs: evalTime
		};
	}
};
