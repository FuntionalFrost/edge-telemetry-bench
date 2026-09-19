// src/lib/client/probes/audioFingerprint.probe.ts
import type { ClientProbe } from '../types';

export const audioFingerprintProbe: ClientProbe<'audio'> = {
	key: 'audio',
	name: 'AudioContext Fingerprint & Farbling',
	async run() {
		if (typeof window === 'undefined') {
			return { audioHash: 'SSR-CONTEXT', isAudioFarbled: false };
		}

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

					if (Math.abs(val - (sample2[i] || 0)) > 0.0000001) {
						isAudioFarbled = true;
					}
				}
				audioHash = `AUD-${Math.abs(audioPolyHash).toString(16).toUpperCase()}`;
			}
		} catch {
			audioHash = 'RESTRICTED';
		}

		return {
			audioHash,
			isAudioFarbled
		};
	}
};
