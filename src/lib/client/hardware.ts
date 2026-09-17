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

		ctx.fillRect(10, 10, 30, 10);
		const secondDataUrl = canvas.toDataURL();
		const thirdDataUrl = canvas.toDataURL();

		// If reading the exact same static canvas state twice yields different data, farbling is active.
		if (secondDataUrl !== thirdDataUrl) {
			isFarblingDetected = true;
		}
	}

	// --- 3. AUDIOCONTEXT FINGERPRINTING & FARBLING DETECTOR ---
	let audioHash = 'UNSUPPORTED';
	let isAudioFarbled = false;
	try {
		const AudioContextClass =
			window.OfflineAudioContext ||
			(window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
				.webkitOfflineAudioContext;

		if (AudioContextClass) {
			const renderAudioSample = async (): Promise<Float32Array> => {
				const audioCtx = new AudioContextClass(1, 44100, 44100);
				const osc = audioCtx.createOscillator();
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(10000, audioCtx.currentTime);

				const compressor = audioCtx.createDynamicsCompressor();
				compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
				compressor.knee.setValueAtTime(40, audioCtx.currentTime);
				compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
				compressor.attack.setValueAtTime(0, audioCtx.currentTime);
				compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

				osc.connect(compressor);
				compressor.connect(audioCtx.destination);
				osc.start(0);

				const renderedBuffer = await audioCtx.startRendering();
				return renderedBuffer.getChannelData(0);
			};

			const [sample1, sample2] = await Promise.all([renderAudioSample(), renderAudioSample()]);

			let audioPolyHash = 0;
			for (let i = 4500; i < 5000; i++) {
				const val = sample1[i] || 0;
				audioPolyHash = (audioPolyHash << 5) - audioPolyHash + Math.round(val * 100000);
				audioPolyHash |= 0;

				// Noise injection check (Safari / Brave Audio farbling)
				if (Math.abs(val - (sample2[i] || 0)) > 0.0000001) {
					isAudioFarbled = true;
				}
			}
			audioHash = `AUD-${Math.abs(audioPolyHash).toString(16).toUpperCase()}`;
		}
	} catch {
		audioHash = 'RESTRICTED';
	}

	// --- 4. SYSTEM FONT METRICS SIGNATURE ---
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

	// --- 5. ACTIVE NETWORK-LEVEL AD-BLOCKER SNOOPING ---
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

	// --- 6. MEMORY LAYER EXTRACTION ---
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

	// --- 7. COMPATIBILITY CORE EXTRACTION ---
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
		},
		audio: {
			audioHash,
			isAudioFarbled
		},
		fonts: {
			fontSignature,
			detectedFontCount
		}
	};
}
