export interface TelemetryReport {
	meta: {
		timestamp: string;
		provider: 'cloudflare' | 'vercel' | 'netlify' | 'unknown';
		executionEngine: string;
	};
	isolateMetrics: {
		isColdStart: boolean;
		isolateAgeMs: number;
		requestsServedByThisIsolateCount: number;
	};
	networking: {
		edgeDatacenterRay: string;
		inferredClientCountry: string;
		totalRoundtripProcessingTimeMs: number;
	};
	computePerformance: {
		stressLoopExecutionTimeMs: number;
		checksumVerification: number;
	};
}

export interface PlatformState {
	name: string;
	url: string;
	data: TelemetryReport | null;
	loading: boolean;
	error: string | null;
	clientLatencyMs: number | null;
}
