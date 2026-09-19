// src/lib/client/probes/fontMetrics.probe.ts
import type { ClientProbe } from '../types';

export const fontMetricsProbe: ClientProbe<'fonts'> = {
	key: 'fonts',
	name: 'System Font Metrics Signature',
	async run() {
		if (typeof document === 'undefined') {
			return { fontSignature: 'SSR-CONTEXT', detectedFontCount: 0 };
		}

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		let fontSignature = 'SIG_NONE';
		let detectedFontCount = 0;

		if (ctx) {
			const testFonts = [
				'monospace',
				'sans-serif',
				'serif',
				'Segoe UI',
				'SF Pro Text',
				'Roboto',
				'Helvetica Neue',
				'Courier New',
				'Consolas',
				'Ubuntu'
			];
			const testString = 'mmmmmmmmmmlli100!@#$';
			let fontHash = 0;

			const baseWidths: Record<string, number> = {};
			for (const base of ['monospace', 'sans-serif', 'serif']) {
				ctx.font = `72px ${base}`;
				baseWidths[base] = ctx.measureText(testString).width;
			}

			for (const font of testFonts) {
				ctx.font = `72px '${font}', monospace`;
				const widthMono = ctx.measureText(testString).width;
				ctx.font = `72px '${font}', sans-serif`;
				const widthSans = ctx.measureText(testString).width;

				if (widthMono !== baseWidths['monospace'] || widthSans !== baseWidths['sans-serif']) {
					detectedFontCount++;
				}

				fontHash = (fontHash << 5) - fontHash + Math.round(widthMono + widthSans);
				fontHash |= 0;
			}
			fontSignature = `FNT-${Math.abs(fontHash).toString(16).toUpperCase()}`;
		}

		return {
			fontSignature,
			detectedFontCount
		};
	}
};
