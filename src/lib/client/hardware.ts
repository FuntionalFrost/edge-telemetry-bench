import type { ClientHardwareMetrics } from '$lib/types';

export async function gatherClientMetrics(): Promise<ClientHardwareMetrics> {
	// Helper to gracefully fallback on missing window properties
	const safeNavigator = typeof navigator !== 'undefined' ? navigator : null;

	// --- 1. OPTIMIZED WEBGL HARDWARE INTERROGATION ---
	const canvas = document.createElement('canvas');
	let gpuVendor = 'Unknown';
	let gpuRenderer = 'Unknown';

	// Prioritize WebGL2, fallback to WebGL
	const gl = (canvas.getContext('webgl2') ||
		canvas.getContext('webgl') ||
		canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

	if (gl) {
		try {
			const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
			if (debugInfo) {
				gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string;
				gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
			}
		} catch {
			// Context isolated or reading parameters restricted by browser safety configs
		} finally {
			// Clean up WebGL context memory explicitly to prevent hardware context exhaustion leaks
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		}
	}

	// --- 2. FIXED CANVAS FINGERPRINTING & REAL FARBLING AUDITOR ---
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

		// Generate fast polynomial hash string
		let hash = 0;
		for (let i = 0; i < firstDataUrl.length; i++) {
			hash = (hash << 5) - hash + firstDataUrl.charCodeAt(i);
			hash |= 0;
		}
		canvasHash = Math.abs(hash).toString(16).toUpperCase();

		// CORRECT FARBLING DETECTION:
		// We make a slight canvas modification and read it again.
		// Privacy browsers (Brave/Safari) apply a distinct noise vector on *every single read operation*.
		// If the canvas is altered predictably but the delta values fluctuate abnormally, it's farbling.
		ctx.fillRect(10, 10, 30, 10);
		const secondDataUrl = canvas.toDataURL();
		const thirdDataUrl = canvas.toDataURL();

		// If reading the exact same static canvas state twice yields different data, farbling is active.
		if (secondDataUrl !== thirdDataUrl) {
			isFarblingDetected = true;
		}
	}

	// --- 3. ACTIVE NETWORK-LEVEL AD-BLOCKER SNOOPING ---
	let adBlockerActive = false;
	try {
		const testAdUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

		// Ensure timeout signal creation won't throw on legacy engines
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 300);

		await fetch(new Request(testAdUrl, { method: 'HEAD', mode: 'no-cors' }), {
			signal: controller.signal
		});
		clearTimeout(timeoutId);
	} catch {
		adBlockerActive = true;
	}

	// --- 4. MEMORY LAYER EXTRACTION ---
	// Safely check for the non-standard Chrome memory extension without using 'any'
	const memory =
		typeof performance !== 'undefined' && 'memory' in performance
			? {
					heapLimitMb: Math.round(
						(performance as Performance & { memory: { jsHeapSizeLimit: number } }).memory
							.jsHeapSizeLimit /
							(1024 * 1024)
					)
				}
			: 'Restricted Sandboxed API';

	// --- 5. COMPATIBILITY CORE EXTRACTION ---
	let hardwareCores: number | 'Unknown' = 'Unknown';
	try {
		if (safeNavigator && typeof safeNavigator.hardwareConcurrency === 'number') {
			hardwareCores = safeNavigator.hardwareConcurrency;
		}
	} catch {
		// Core tracking blocked by security sandbox execution limits
	}

	return {
		cores: hardwareCores,
		gpu: { vendor: gpuVendor, renderer: gpuRenderer },
		memory,
		webGPU: safeNavigator ? 'gpu' in safeNavigator : false,
		userAgent: safeNavigator ? safeNavigator.userAgent : 'Unknown Context',
		fingerprint: {
			canvasHash: `CANVAS-ID-${canvasHash}`,
			isFarblingDetected,
			adBlockerActive
		}
	};
}
