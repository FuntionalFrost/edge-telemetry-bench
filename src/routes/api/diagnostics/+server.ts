import type { RequestHandler } from './$types';

// Infrastructure Concept: Isolate-Level Global State
// This memory space persists across requests handled by the same hot serverless container instance.
const instanceSpawnTime = Date.now();
let totalRequestsHandledByThisIsolate = 0;

export const GET: RequestHandler = async ({ request, platform }) => {
	totalRequestsHandledByThisIsolate++;
	const requestStartTime = performance.now();

	// 1. Detect the Host Infrastructure Engine
	let provider = 'unknown';
	let engine = 'unknown';

	// Check for Deno (Netlify Edge architecture engine)
	if (typeof Deno !== 'undefined') {
		provider = 'netlify';
		engine = 'Deno Deploy (V8 Isolate)';
	}
	// Check for Cloudflare-specific platform objects
	else if (platform?.env && !request.headers.get('x-vercel-id')) {
		provider = 'cloudflare';
		engine = 'Cloudflare workerd (V8 Isolate)';
	}
	// Check for Vercel-specific ingress routing markers
	else if (request.headers.get('x-vercel-id')) {
		provider = 'vercel';
		engine = 'Vercel Fluid Compute';
	}

	// 2. Extract Ingress Geolocation & Datacenter Telemetry
	// Cloudflare assigns routing codes to 'cf-ray', Vercel to 'x-vercel-id', Netlify to headers or geo bindings
	const rayId = request.headers.get('cf-ray') || request.headers.get('x-vercel-id') || 'N/A';
	const clientCountry =
		request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-country') || 'Unknown';

	// 3. Compute-Isolation Stress Benchmark (CPU Throttle Test)
	// We run a fixed cryptographic/mathematical loop to gauge raw processing speeds on different tiers.
	// Cloudflare Free imposes a hard 50ms CPU limit. Let's trace operational duration.
	const cpuBenchmarkStart = performance.now();
	let calculationAccumulator = 0;
	for (let i = 0; i < 500_000; i++) {
		calculationAccumulator += Math.sin(i) * Math.cos(i);
	}
	const cpuBenchmarkDurationMs = performance.now() - cpuBenchmarkStart;

	// 4. Assemble Telemetry Payload
	const telemetryReport = {
		meta: {
			timestamp: new Date().toISOString(),
			provider,
			executionEngine: engine
		},
		isolateMetrics: {
			isColdStart: totalRequestsHandledByThisIsolate === 1,
			isolateAgeMs: Date.now() - instanceSpawnTime,
			requestsServedByThisIsolateCount: totalRequestsHandledByThisIsolate
		},
		networking: {
			edgeDatacenterRay: rayId,
			inferredClientCountry: clientCountry,
			totalRoundtripProcessingTimeMs: performance.now() - requestStartTime
		},
		computePerformance: {
			stressLoopExecutionTimeMs: cpuBenchmarkDurationMs,
			checksumVerification: calculationAccumulator
		}
	};

	return new Response(JSON.stringify(telemetryReport, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			// Strictly disable downstream CDN caching so we always measure live compute
			'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
		}
	});
};
