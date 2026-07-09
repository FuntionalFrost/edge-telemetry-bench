<script lang="ts">
	import type { PlatformState, TelemetryReport } from '$lib/types';

	// Reactive array containing the deployment configurations for your edge platforms
	let platforms = $state<PlatformState[]>([
		{
			name: 'Cloudflare Workers',
			url: 'https://your-project.pages.dev/api/diagnostics', // Update this once deployed
			data: null,
			loading: false,
			error: null,
			clientLatencyMs: null
		},
		{
			name: 'Vercel Edge',
			url: 'https://your-project.vercel.app/api/diagnostics', // Update this once deployed
			data: null,
			loading: false,
			error: null,
			clientLatencyMs: null
		},
		{
			name: 'Netlify Edge',
			url: 'https://your-project.netlify.app/api/diagnostics', // Update this once deployed
			data: null,
			loading: false,
			error: null,
			clientLatencyMs: null
		}
	]);

	async function fetchPlatformTelemetry(index: number) {
		const target = platforms[index];
		target.loading = true;
		target.error = null;

		const startTime = performance.now();

		try {
			// Append a cache-busting timestamp to bypass browser-level routing interception
			const response = await fetch(`${target.url}?cb=${Date.now()}`);
			if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

			const payload = (await response.json()) as TelemetryReport;

			target.clientLatencyMs = Math.round(performance.now() - startTime);
			target.data = payload;
		} catch (err: any) {
			target.error = err.message || 'Failed to capture telemetry payload.';
			target.data = null;
		} finally {
			target.loading = false;
		}
	}

	function runGlobalDiagnostics() {
		// Concurrent execution across all independent platforms via their indices
		platforms.forEach((_, index) => fetchPlatformTelemetry(index));
	}
</script>

<main class="dashboard-container">
	<header class="dashboard-header">
		<h1>Global Edge Telemetry Grid</h1>
		<p class="subtitle">Multi-Cloud Runtime Benchmark & Observability Platform</p>
		<button onclick={runGlobalDiagnostics} class="trigger-button">
			Trigger Concurrent Compute Probe
		</button>
	</header>

	<div class="grid-layout">
		{#each platforms as platform (platform.name)}
			<section class="platform-card {platform.data?.meta.provider}">
				<div class="card-header">
					<h2>{platform.name}</h2>
					<span
						class="status-indicator"
						class:active={platform.data}
						class:loading={platform.loading}
					></span>
				</div>

				{#if platform.loading}
					<div class="state-message">Interrogating remote edge isolate...</div>
				{:else if platform.error}
					<div class="state-message error">
						<strong>Operational Failure:</strong>
						{platform.error}
						<p class="tip">Ensure URLs are mapped correctly and CORS profile is clear.</p>
					</div>
				{:else if platform.data}
					<div class="telemetry-metrics">
						<div class="metric-group">
							<h3>Infrastructure Meta</h3>
							<div class="row">
								<span>Engine:</span> <strong>{platform.data.meta.executionEngine}</strong>
							</div>
							<div class="row">
								<span>Isolate Instance:</span>
								<strong class={platform.data.isolateMetrics.isColdStart ? 'cold' : 'warm'}>
									{platform.data.isolateMetrics.isColdStart ? '🥶 Cold Start' : '🔥 Warm Instance'}
								</strong>
							</div>
							<div class="row">
								<span>Served Count:</span>
								<strong>{platform.data.isolateMetrics.requestsServedByThisIsolateCount} reqs</strong
								>
							</div>
						</div>

						<div class="metric-group">
							<h3>Latency & Network Ingress</h3>
							<div class="row">
								<span>Client Roundtrip:</span>
								<strong class="highlight">{platform.clientLatencyMs} ms</strong>
							</div>
							<div class="row">
								<span>Internal Processing:</span>
								<strong
									>{platform.data.networking.totalRoundtripProcessingTimeMs.toFixed(2)} ms</strong
								>
							</div>
							<div class="row">
								<span>Edge Location ID:</span>
								<span class="mono-text">{platform.data.networking.edgeDatacenterRay}</span>
							</div>
						</div>

						<div class="metric-group">
							<h3>Compute Performance</h3>
							<div class="row">
								<span>Stress Loop Duration:</span>
								<strong
									>{platform.data.computePerformance.stressLoopExecutionTimeMs.toFixed(2)} ms</strong
								>
							</div>
						</div>
					</div>
				{:else}
					<div class="state-message idle">Awaiting execution trigger...</div>
				{/if}
			</section>
		{/each}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		background-color: #0f172a;
		color: #e2e8f0;
	}

	.dashboard-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.dashboard-header {
		text-align: center;
		margin-bottom: 3rem;
		border-bottom: 1px solid #334155;
		padding-bottom: 2rem;
	}

	h1 {
		margin: 0;
		font-size: 2.5rem;
		color: #f8fafc;
		font-weight: 800;
	}
	.subtitle {
		color: #94a3b8;
		font-size: 1.1rem;
		margin: 0.5rem 0 1.5rem 0;
	}

	.trigger-button {
		background-color: #2563eb;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	.trigger-button:hover {
		background-color: #1d4ed8;
	}

	.grid-layout {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.platform-card {
		background-color: #1e293b;
		border-radius: 0.75rem;
		padding: 1.5rem;
		border: 1px solid #334155;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #334155;
		padding-bottom: 0.75rem;
		margin-bottom: 1rem;
	}

	.card-header h2 {
		margin: 0;
		font-size: 1.3rem;
		color: #f1f5f9;
	}

	.status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: #64748b;
	}
	.status-indicator.active {
		background-color: #10b981;
	}
	.status-indicator.loading {
		background-color: #f59e0b;
		animation: pulse 1s infinite alternate;
	}

	.state-message {
		color: #94a3b8;
		text-align: center;
		padding: 3rem 1rem;
		font-style: italic;
	}
	.state-message.error {
		color: #ef4444;
		font-style: normal;
		text-align: left;
		padding: 1rem 0;
	}
	.tip {
		font-size: 0.85rem;
		color: #64748b;
		margin-top: 0.5rem;
	}

	.metric-group {
		margin-bottom: 1.5rem;
	}
	.metric-group h3 {
		font-size: 0.9rem;
		color: #38bdf8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem 0;
	}

	.row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.4rem;
		font-size: 0.95rem;
	}
	.row span {
		color: #94a3b8;
	}

	.mono-text {
		font-family: monospace;
		font-size: 0.8rem;
		background-color: #0f172a;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		color: #cbd5e1;
		max-width: 220px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.highlight {
		color: #10b981;
		font-size: 1.1rem;
	}
	.cold {
		color: #38bdf8;
	}
	.warm {
		color: #f59e0b;
	}

	@keyframes pulse {
		from {
			opacity: 0.4;
		}
		to {
			opacity: 1;
		}
	}
</style>
