import type { ClientHardwareMetrics } from '../types';

export async function gatherClientMetrics(): Promise<ClientHardwareMetrics> {
	const canvas = document.createElement('canvas');
	const gl = (canvas.getContext('webgl') ||
		canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
	let gpuVendor = 'Unknown';
	let gpuRenderer = 'Unknown';

	if (gl) {
		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
		if (debugInfo) {
			gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string;
			gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
		}
	}

	// 1. CANVAS FINGERPRINTING & FARBLING AUDITOR
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

		const dataUrl = canvas.toDataURL();
		let hash = 0;
		for (let i = 0; i < dataUrl.length; i++) {
			hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
			hash |= 0;
		}
		canvasHash = Math.abs(hash).toString(16).toUpperCase();

		// Check Farbling: Brave/Safari modify pixel arrays dynamically.
		// If we re-draw and the hash changes within milliseconds, the browser is actively lying to us.
		ctx.fillRect(10, 10, 30, 10);
		const secondDataUrl = canvas.toDataURL();
		if (dataUrl === secondDataUrl && navigator.userAgent.includes('Brave')) {
			isFarblingDetected = true;
		}
	}

	// 2. ACTIVE TELEMETRY AD-BLOCKER SNOOPING
	let adBlockerActive = false;
	try {
		// Attempt to fetch a resource explicitly named like common tracking scripts
		const testAdUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
		await fetch(new Request(testAdUrl, { method: 'HEAD', mode: 'no-cors' }), {
			signal: AbortSignal.timeout(300)
		});
	} catch {
		adBlockerActive = true; // Blocked by browser network layer extension
	}

	const strictPerf = performance as unknown as { memory?: { jsHeapSizeLimit: number } };
	const memory = strictPerf.memory
		? { heapLimitMb: Math.round(strictPerf.memory.jsHeapSizeLimit / (1024 * 1024)) }
		: 'Restricted Sandboxed API';

	return {
		cores: (navigator.hardwareConcurrency || 'Unknown') as number | 'Unknown',
		gpu: { vendor: gpuVendor, renderer: gpuRenderer },
		memory,
		webGPU: 'gpu' in navigator,
		userAgent: navigator.userAgent,
		fingerprint: {
			canvasHash: `CANVAS-ID-${canvasHash}`,
			isFarblingDetected,
			adBlockerActive
		}
	};
}
