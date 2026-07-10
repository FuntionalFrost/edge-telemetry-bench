import type { RequestHandler } from './$types';

// Vercel Route Flag: Pin this deployment slice to Vercel's fluid runtime
export const config = {
	runtime: 'edge'
};

// Global context primitives for tracking compute isolate lifetime
const isolateSpawnTime = Date.now();
let requestsProcessedByThisIsolate = 0;

export const GET: RequestHandler = async ({ request, platform }) => {
	requestsProcessedByThisIsolate++;
	const sampleStartTime = performance.now();

	// 1. Core Runtime Auto-Detection Loop
	let provider: 'cloudflare' | 'vercel' | 'netlify' | 'local' = 'local';
	let runtimeEngine = 'Node.js Engine (Development Workspace)';

	if (typeof Deno !== 'undefined') {
		provider = 'netlify';
		runtimeEngine = 'Deno Deploy Core (V8 Isolate Layer)';
	} else if (platform?.env && !request.headers.get('x-vercel-id')) {
		provider = 'cloudflare';
		runtimeEngine = 'Cloudflare workerd (Native V8 Isolate)';
	} else if (request.headers.get('x-vercel-id')) {
		provider = 'vercel';
		runtimeEngine = 'Vercel Fluid Compute Edge Layer';
	}

	// 2. High-Precision Event Loop Lag Measurement
	// Measures how long it takes a macro-task to execute, revealing host scheduling delays.
	const eventLoopBenchStart = performance.now();
	await new Promise((resolve) => setTimeout(resolve, 0));
	const eventLoopLagMs = performance.now() - eventLoopBenchStart;

	// 3. Runtime Environmental Inspection (The Meta Flex)
	// Extract the global keys available in this specific runtime environment
	const globalScopeKeys = Object.keys(globalThis).slice(0, 15);

	// 4. Ingress Routing Network Capture
	const datacenterRay =
		request.headers.get('cf-ray') || request.headers.get('x-vercel-id') || 'Local Network Loop';
	const clientCountry =
		request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-country') || 'Localhost';

	const telemetryPayload = {
		nodeIdentity: {
			provider,
			engine: runtimeEngine,
			timestamp: new Date().toISOString()
		},
		isolateState: {
			isColdStart: requestsProcessedByThisIsolate === 1,
			isolateUptimeMs: Date.now() - isolateSpawnTime,
			activationCount: requestsProcessedByThisIsolate
		},
		performanceTelemetry: {
			eventLoopSchedulingLagMs: eventLoopLagMs,
			internalComputeDurationMs: performance.now() - sampleStartTime
		},
		networkIngress: {
			routingRayId: datacenterRay,
			ingressCountryCode: clientCountry
		},
		environmentBlueprint: {
			availableGlobalObjectsCount: Object.keys(globalThis).length,
			sampleGlobalKeys: globalScopeKeys
		}
	};

	return new Response(JSON.stringify(telemetryPayload, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
		}
	});
};
