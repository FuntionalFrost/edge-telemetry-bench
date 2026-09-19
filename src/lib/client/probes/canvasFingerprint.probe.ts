// src/lib/client/probes/canvasFingerprint.probe.ts
import type { ClientProbe } from '../types';

export const canvasFingerprintProbe: ClientProbe<'fingerprint'> = {
	key: 'fingerprint',
	name: 'Canvas Fingerprint & Noise Farbling',
	async run() {
		if (typeof document === 'undefined') {
			return { canvasHash: 'SSR-CONTEXT', isFarblingDetected: false, adBlockerActive: false };
		}

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		let canvasHash = 'Unsupported';
		let isFarblingDetected = false;

		if (ctx) {
			canvas.width = 200;
			canvas.height = 50;
			ctx.textBaseline = 'top';
			ctx.font = "14px 'Arial'";
			ctx.fillStyle = '#f60';
			ctx.fillRect(125, 1, 62, 20);
			ctx.fillStyle = '#069';
			ctx.fillText('🕵️_telemetry_mesh_0x9A', 2, 2);
			ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
			ctx.fillText('🕵️_telemetry_mesh_0x9A', 4, 4);

			const firstDataUrl = canvas.toDataURL();
			let hash = 0;
			for (let i = 0; i < firstDataUrl.length; i++) {
				hash = (hash << 5) - hash + firstDataUrl.charCodeAt(i);
				hash |= 0;
			}
			canvasHash = Math.abs(hash).toString(16).toUpperCase();

			ctx.fillRect(10, 10, 30, 10);
			const secondDataUrl = canvas.toDataURL();
			const thirdDataUrl = canvas.toDataURL();

			if (secondDataUrl !== thirdDataUrl) {
				isFarblingDetected = true;
			}
		}

		let adBlockerActive = false;
		try {
			const testAdUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 300);

			await fetch(new Request(testAdUrl, { method: 'HEAD', mode: 'no-cors' }), {
				signal: controller.signal
			});
			clearTimeout(timeoutId);
		} catch {
			adBlockerActive = true;
		}

		return {
			canvasHash: `CANVAS-ID-${canvasHash}`,
			isFarblingDetected,
			adBlockerActive
		};
	}
};
