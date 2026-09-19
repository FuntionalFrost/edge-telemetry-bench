// src/lib/client/probes/index.ts
import type { ClientProbe } from '../types';
import { gpuHardwareProbe } from './gpuHardware.probe';
import { canvasFingerprintProbe } from './canvasFingerprint.probe';
import { audioFingerprintProbe } from './audioFingerprint.probe';
import { fontMetricsProbe } from './fontMetrics.probe';
import { clientHintsProbe } from './clientHints.probe';
import { networkInfoProbe } from './networkInfo.probe';
import { resourceTimingProbe } from './resourceTiming.probe';
import { webrtcIceProbe } from './webrtcIce.probe';
import { networkJitterProbe } from './networkJitter.probe';
import { longTasksProbe } from './longTasks.probe';
import { frameTimingProbe } from './frameTiming.probe';
import { layoutThrashingProbe } from './layoutThrashing.probe';

// Registry of all client-side browser forensics and performance benchmarks
export const CLIENT_PROBES: ClientProbe[] = [
	gpuHardwareProbe,
	canvasFingerprintProbe,
	audioFingerprintProbe,
	fontMetricsProbe,
	clientHintsProbe,
	networkInfoProbe,
	resourceTimingProbe,
	webrtcIceProbe,
	networkJitterProbe,
	longTasksProbe,
	frameTimingProbe,
	layoutThrashingProbe
];
