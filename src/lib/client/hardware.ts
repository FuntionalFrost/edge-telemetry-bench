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

	// Avoid explicit 'any' by structuring an intentional shadow-interface check
	const strictPerf = performance as unknown as { memory?: { jsHeapSizeLimit: number } };
	const memory = strictPerf.memory
		? { heapLimitMb: Math.round(strictPerf.memory.jsHeapSizeLimit / (1024 * 1024)) }
		: 'Restricted Sandboxed API';

	return {
		// Force type-safety match for the strict union type
		cores: (navigator.hardwareConcurrency || 'Unknown') as number | 'Unknown',
		gpu: { vendor: gpuVendor, renderer: gpuRenderer },
		memory,
		webGPU: 'gpu' in navigator,
		userAgent: navigator.userAgent
	};
}
