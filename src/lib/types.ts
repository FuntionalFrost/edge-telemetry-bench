export interface TelemetryReport {
	nodeIdentity: {
		provider: 'cloudflare' | 'vercel' | 'netlify' | 'local';
		engine: string;
		engineVersion: string;
		timestamp: string;
	};
	isolateState: {
		isColdStart: boolean;
		isolateUptimeMs: number;
		activationCount: number;
	};
	performanceTelemetry: {
		eventLoopSchedulingLagMs: number;
		internalComputeDurationMs: number;
	};
	networkIngress: {
		routingRayId: string;
		ingressCountryCode: string;
	};
	environmentBlueprint: {
		availableGlobalObjectsCount: number;
		sampleGlobalKeys: string[];
	};
}
