// src/lib/client/probes/webrtcIce.probe.ts
import type { ClientProbe } from '../types';

export const webrtcIceProbe: ClientProbe<'webrtc'> = {
	key: 'webrtc',
	name: 'WebRTC ICE Candidate Discovery',
	async run() {
		if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
			return {
				iceGatheringDurationMs: 0,
				candidateCount: 0,
				candidateTypes: ['Unsupported Context'],
				protocols: ['None']
			};
		}

		return new Promise((resolve) => {
			const start = performance.now();
			const candidateTypes = new Set<string>();
			const protocols = new Set<string>();
			let candidateCount = 0;
			let isResolved = false;

			let pc: RTCPeerConnection | null = null;
			let timeoutId: ReturnType<typeof setTimeout> | null = null;

			const finish = () => {
				if (isResolved) return;
				isResolved = true;
				if (timeoutId) clearTimeout(timeoutId);
				const duration = Math.round(performance.now() - start);

				try {
					pc?.close();
				} catch {
					// Ignore cleanup errors
				}

				resolve({
					iceGatheringDurationMs: duration,
					candidateCount,
					candidateTypes: candidateTypes.size > 0 ? Array.from(candidateTypes) : ['host'],
					protocols:
						protocols.size > 0 ? Array.from(protocols).map((p) => p.toUpperCase()) : ['UDP']
				});
			};

			try {
				pc = new RTCPeerConnection({
					iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]
				});

				// Create non-transmitting data channel to trigger ICE negotiation
				pc.createDataChannel('telemetry_probe');

				pc.onicecandidate = (event) => {
					if (event.candidate) {
						candidateCount++;
						if (event.candidate.type) candidateTypes.add(event.candidate.type);
						if (event.candidate.protocol) protocols.add(event.candidate.protocol);
					} else {
						// null candidate denotes end of ICE gathering
						finish();
					}
				};

				pc.createOffer()
					.then((offer) => pc?.setLocalDescription(offer))
					.catch(() => finish());

				// Strict 450ms safety cap so it never stalls the dashboard
				timeoutId = setTimeout(finish, 450);
			} catch {
				finish();
			}
		});
	}
};
