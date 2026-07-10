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

	// 1. Core Runtime Auto-Detection Loop & Platform Version Extraction
	let provider: 'cloudflare' | 'vercel' | 'netlify' | 'local' = 'local';
	let runtimeEngine = 'Node.js Engine';
	let engineVersion: string;

	// WinterCG standard lookup shortcut for modern edge instances
	const userAgentString = typeof navigator !== 'undefined' ? navigator.userAgent : '';

	if (typeof Deno !== 'undefined') {
		const deno = Deno as object as { version: { deno: string } };
		provider = 'netlify';
		runtimeEngine = 'Netlify Edge Function';
		// Netlify runs Deno Deploy, providing true runtime SemVer out-of-the-box
		engineVersion = `Deno v${deno.version.deno}`;
	} else if (platform?.env && !request.headers.get('x-vercel-id')) {
		provider = 'cloudflare';
		runtimeEngine = 'Cloudflare Worker';
		// Cloudflare uses the API Compatibility Epoch as its version axis
		engineVersion = 'Epoch v2026-01-01';
	} else if (request.headers.get('x-vercel-id') || userAgentString.includes('Vercel')) {
		provider = 'vercel';
		runtimeEngine = 'Vercel Edge Function';
		// Vercel handles versioning as an abstract system fabric identifier
		engineVersion = 'Fluid Isolate API';
	} else {
		// Local development engine footprint tracking
		const nodeVer = typeof process !== 'undefined' ? process.versions?.node : 'Workspace';
		engineVersion = `Node.js v${nodeVer}`;
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
			engineVersion,
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
