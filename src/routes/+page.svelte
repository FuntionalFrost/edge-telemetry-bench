<script lang="ts">
	import { onMount } from 'svelte';
	// Import the exact contract definition
	import type { TelemetryReport } from '$lib/types';

	let loading = $state(true);
	let error = $state<string | null>(null);

	// FIX: Explicitly type the state rune so the compiler expects the exact metadata keys
	let report = $state<TelemetryReport | null>(null);
	let networkLatencyMs = $state<number | null>(null);

	async function runSelfDiagnostics() {
		loading = true;
		error = null;
		const timerStart = performance.now();

		try {
			const response = await fetch(`/api/diagnostics?cb=${Date.now()}`);
			if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);

			// Type assertion on the incoming JSON payload stream
			report = (await response.json()) as TelemetryReport;
			networkLatencyMs = Math.round(performance.now() - timerStart);
		} catch (err: unknown) {
			error = (err as Error).message || 'Failed to initialize system telemetry query.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		runSelfDiagnostics();
	});
</script>

<main class="meta-dashboard {report?.nodeIdentity.provider || 'local'}">
	<div class="glow-effect"></div>

	<header class="hero-section">
		<div class="badge">Active Infrastructure Node</div>
		<h1>Self-Aware Telemetry Console</h1>
		<p class="desc">A look inside the active serverless isolate container.</p>
	</header>

	{#if loading}
		<div class="loader-container">
			<div class="spinner"></div>
			<p>Interrogating isolated V8 execution context...</p>
		</div>
	{:else if error}
		<div class="error-panel">
			<h2>System Fault Encountered</h2>
			<p>{error}</p>
			<button onclick={runSelfDiagnostics}>Re-probe Runtime</button>
		</div>
	{:else if report}
		<div class="dashboard-grid">
			<section class="metric-card node-id">
				<h3>Host Node Blueprint</h3>
				<div class="huge-display">{report.nodeIdentity.provider.toUpperCase()}</div>
				<p class="engine-spec">{report.nodeIdentity.engine}</p>
				<hr />
				<div class="data-row">
					<span>Deployment Ingress:</span>
					<strong class="mono">{report.networkIngress.routingRayId}</strong>
				</div>
				<div class="data-row">
					<span>Ingress Country:</span> <strong>{report.networkIngress.ingressCountryCode}</strong>
				</div>
			</section>

			<section class="metric-card isolate-lifecycle">
				<h3>Isolate Container State</h3>
				<div class="state-banner {report.isolateState.isColdStart ? 'cold' : 'warm'}">
					{report.isolateState.isColdStart ? '🥶 COLD START BLOCK' : '🔥 WARM ISOLATE RESUSE'}
				</div>
				<div class="data-row">
					<span>Isolate Age:</span> <strong>{report.isolateState.isolateUptimeMs} ms</strong>
				</div>
				<div class="data-row">
					<span>Requests Handled:</span>
					<strong>{report.isolateState.activationCount} executions</strong>
				</div>
				<p class="explainer">
					Refreshing this dashboard tracks whether your cloud provider routes requests to the same
					long-lived V8 container or spins up a fresh instance.
				</p>
			</section>

			<section class="metric-card micro-benchmarks">
				<h3>Micro-Architectural Timing</h3>
				<div class="large-metric">
					<span>Event Loop Delay:</span>
					<strong class="warn"
						>{report.performanceTelemetry.eventLoopSchedulingLagMs.toFixed(3)} ms</strong
					>
				</div>
				<div class="large-metric">
					<span>Total Ingress Roundtrip:</span>
					<strong class="success">{networkLatencyMs} ms</strong>
				</div>
				<div class="large-metric">
					<span>Internal Execution Time:</span>
					<strong>
						{report.performanceTelemetry.internalComputeDurationMs === 0
							? '🛡️ 0.00 ms (Coarsened Timer)'
							: `${report.performanceTelemetry.internalComputeDurationMs.toFixed(3)} ms`}
					</strong>
				</div>
				{#if report.nodeIdentity.provider === 'cloudflare' || report.nodeIdentity.provider === 'vercel'}
					<p class="timer-note">
						⚠️ Clock coarsened by host runtime engine to prevent Spectre timing attacks.
					</p>
				{/if}
			</section>

			<section class="metric-card global-inspection">
				<h3>
					Global Context Key Footprint ({report.environmentBlueprint.availableGlobalObjectsCount} keys)
				</h3>
				<p class="explainer">
					First {report.environmentBlueprint.sampleGlobalKeys.length} system primitives exposed inside
					this isolate container namespace:
				</p>
				<div class="key-tags">
					{#each report.environmentBlueprint.sampleGlobalKeys as key (key)}
						<span class="key-tag">{key}</span>
					{/each}
				</div>
			</section>
		</div>

		<footer class="action-footer">
			<button onclick={runSelfDiagnostics} class="probe-btn">Execute Fresh System Inspection</button
			>
		</footer>
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		background-color: #0b0f19;
		color: #f1f5f9;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	.meta-dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
		position: relative;
	}

	.hero-section {
		text-align: center;
		margin-bottom: 4rem;
	}
	h1 {
		font-size: 2.5rem;
		margin: 0.5rem 0;
		font-weight: 800;
		letter-spacing: -0.05em;
		color: #ffffff;
	}
	.desc {
		color: #94a3b8;
		font-size: 1.1rem;
		margin: 0;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 700;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 2rem;
	}

	.metric-card {
		background: #111827;
		border: 1px solid #1f2937;
		border-radius: 0.5rem;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	h3 {
		margin-top: 0;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #64748b;
	}

	.huge-display {
		font-size: 3rem;
		font-weight: 900;
		letter-spacing: -0.02em;
		line-height: 1;
		margin: 1rem 0 0.5rem 0;
	}
	.engine-spec {
		margin: 0 0 1.5rem 0;
		color: #94a3b8;
		font-size: 0.9rem;
	}
	hr {
		border: 0;
		border-top: 1px solid #1f2937;
		margin: 1.5rem 0;
	}

	.data-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.6rem;
		font-size: 0.9rem;
	}
	.data-row span {
		color: #64748b;
	}
	.mono {
		font-size: 0.8rem;
		background: #030712;
		padding: 0.1rem 0.4rem;
		border-radius: 0.25rem;
	}

	.state-banner {
		text-align: center;
		padding: 0.75rem;
		border-radius: 0.375rem;
		font-weight: 700;
		font-size: 1rem;
		margin-bottom: 1.5rem;
		letter-spacing: 0.05em;
	}
	.state-banner.cold {
		background: rgba(14, 165, 233, 0.15);
		color: #38bdf8;
		border: 1px solid rgba(14, 165, 233, 0.3);
	}
	.state-banner.warm {
		background: rgba(245, 158, 11, 0.15);
		color: #fbbf24;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.large-metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #030712;
		padding: 1rem;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
	}
	.large-metric span {
		color: #94a3b8;
		font-size: 0.9rem;
	}
	.large-metric strong {
		font-size: 1.2rem;
	}

	.explainer {
		font-size: 0.85rem;
		color: #64748b;
		line-height: 1.5;
		margin: 1rem 0 0 0;
	}

	.key-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	.key-tag {
		font-size: 0.75rem;
		background: #1f2937;
		padding: 0.2rem 0.5rem;
		border-radius: 0.25rem;
		color: #cbd5e1;
		border: 1px solid #374151;
	}

	.action-footer {
		text-align: center;
		margin-top: 4rem;
	}
	.probe-btn {
		background: #ffffff;
		color: #000000;
		border: none;
		padding: 1rem 2rem;
		font-family: inherit;
		font-weight: 700;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: opacity 0.2s;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.probe-btn:hover {
		opacity: 0.9;
	}

	/* VENDOR SPECIFIC DESIGN MODIFICATIONS */
	.cloudflare .huge-display {
		color: #f97316;
	}
	.cloudflare .badge {
		color: #f97316;
		border-color: rgba(249, 115, 22, 0.3);
		background: rgba(249, 115, 22, 0.05);
	}

	.vercel .huge-display {
		color: #ffffff;
	}
	.vercel .badge {
		color: #ffffff;
		border-color: rgba(255, 255, 255, 0.3);
	}

	.netlify .huge-display {
		color: #2dd4bf;
	}
	.netlify .badge {
		color: #2dd4bf;
		border-color: rgba(45, 212, 191, 0.3);
		background: rgba(45, 212, 191, 0.05);
	}

	/* STATE ANIMATIONS */
	.loader-container {
		text-align: center;
		padding: 5rem 0;
		color: #94a3b8;
	}
	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #1f2937;
		border-top-color: #ffffff;
		border-radius: 50%;
		margin: 0 auto 1.5rem auto;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.success {
		color: #10b981;
	}
	.warn {
		color: #ef4444;
	}
</style>
