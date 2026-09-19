// src/lib/client/probes/gpuHardware.probe.ts
import type { ClientProbe } from '../types';

export const gpuHardwareProbe: ClientProbe<'gpu'> = {
	key: 'gpu',
	name: 'GPU Hardware Extraction',
	async run() {
		if (typeof document === 'undefined') {
			return { vendor: 'SSR Environment', renderer: 'SSR Environment' };
		}

		const canvas = document.createElement('canvas');
		let gpuVendor = 'Unknown';
		let gpuRenderer = 'Unknown';

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
				// Reading blocked by security sandbox
			} finally {
				gl.getExtension('WEBGL_lose_context')?.loseContext();
			}
		}

		return { vendor: gpuVendor, renderer: gpuRenderer };
	}
};
