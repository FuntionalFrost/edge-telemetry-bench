<script lang="ts">
	import { gatherClientMetrics } from '$lib/client/hardware';
	import { onMount } from 'svelte';

	import type {
		ClientHardwareMetrics,
		ClockChunk,
		ConcurrencyChunk,
		DiagnosticStreamChunk,
		IdentityChunk,
		MemoryEgressChunk,
		WasmChunk
	} from '$lib/types';

	let serverIdentity = $state<IdentityChunk | null>(null);
	let clockTelemetry = $state<ClockChunk | null>(null);
	let wasmTelemetry = $state<WasmChunk | null>(null);
	let memoryTelemetry = $state<MemoryEgressChunk | null>(null);
	let egressTelemetry = $state<MemoryEgressChunk | null>(null);
	let concurrencyTelemetry = $state<ConcurrencyChunk | null>(null);
	let clientTelemetry = $state<ClientHardwareMetrics | null>(null);

	let streamActive = $state(false);
	let streamHaltedUnexpectedly = $state(false);
	let networkLatency = $state<number | null>(null);

	async function streamDiagnostics() {
		streamActive = true;
		streamHaltedUnexpectedly = false;
		const startTime = performance.now();

		try {
			const response = await fetch('/api/diagnostics');
			if (!response.body) return;
			networkLatency = Math.round(performance.now() - startTime);

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (!line.trim()) continue;
					const chunk = JSON.parse(line) as DiagnosticStreamChunk;

					switch (chunk.type) {
						case 'identity':
							serverIdentity = chunk.data;
							break;
						case 'clock':
							clockTelemetry = chunk.data;
							break;
						case 'wasm':
							wasmTelemetry = chunk.data;
							break;
						case 'memory':
							memoryTelemetry = chunk.data;
							break;
						case 'egress':
							egressTelemetry = chunk.data;
							break;
						case 'concurrency':
							concurrencyTelemetry = chunk.data;
							break;
						case 'panic':
							throw new Error(chunk.data.message);
					}
				}
			}
		} catch (e) {
			console.error('Telemetry Interruption Matrix:', e);
			streamHaltedUnexpectedly = true;
		} finally {
			streamActive = false;
		}
	}

	onMount(async () => {
		clientTelemetry = await gatherClientMetrics();
		streamDiagnostics();
	});
</script>

<main class="dashboard-root">
	<header class="matrix-header">
		<div class="status-pulse {streamActive ? 'active' : 'idle'}"></div>
		<h1>ISOLATE INTERROGATOR // V8-CLIENT.MESH</h1>
		<p class="subtitle">
			Interrogating runtime configurations & architectural sandboxes via stream execution.
		</p>
		{#if networkLatency !== null}
			<div class="network-tag">
				Handshake Ingress RTT: <span class="text-cyan">{networkLatency}ms</span>
			</div>
		{/if}
	</header>

	<div class="grid-container">
		<section class="card">
			<h2>[01] SERVER ISOLATE ENVIRONMENT</h2>
			{#if serverIdentity}
				<div class="stat">
					<span class="lbl">Uptime:</span>
					<span class="val">{serverIdentity.uptimeMs.toFixed(1)} ms</span>
				</div>
				<div class="stat">
					<span class="lbl">Activations:</span>
					<span class="val text-green">{serverIdentity.activations}</span>
				</div>
				<div class="stat">
					<span class="lbl">Global Namespace Primitives:</span>
					<span class="val">{serverIdentity.globalKeysCount} keys</span>
				</div>
			{:else}
				<div class="shimmer">Awaiting stream connection...</div>
			{/if}
		</section>

		<section class="card">
			<h2>[02] SIDE-CHANNEL CLOCK RESOLUTION</h2>
			{#if clockTelemetry}
				<div class="stat">
					<span class="lbl">Timer Resolution:</span>
					<span class="val">{clockTelemetry.minIncrementMs.toFixed(5)} ms</span>
				</div>
				<div class="stat">
					<span class="lbl">Spectre Mitigation Mask:</span>
					<span class="val {clockTelemetry.isCoarsened ? 'warn' : 'clear'}"
						>{clockTelemetry.estimatedMitigationLevel}</span
					>
				</div>
			{:else}
				<div class="shimmer">Probing timing pipelines...</div>
			{/if}
		</section>

		<section class="card">
			<h2>[03] WASM INTERPRETATION SANDBOX</h2>
			{#if wasmTelemetry}
				<div class="stat">
					<span class="lbl">Dynamic Compilation:</span>
					<span class="val status-tag" class:allowed={wasmTelemetry.allowed}
						>{wasmTelemetry.allowed ? 'UNRESTRICTED' : 'BLOCKED'}</span
					>
				</div>
				{#if wasmTelemetry.allowed}
					<div class="stat">
						<span class="lbl">JIT Compile Time:</span>
						<span class="val">{wasmTelemetry.compileDurationMs.toFixed(3)} ms</span>
					</div>
				{/if}
			{:else}
				<div class="shimmer">Testing byte compilation execution restrictions...</div>
			{/if}
		</section>

		<section class="card">
			<h2>[04] BOUNDARY EXPLORATION & EGRESS</h2>
			{#if memoryTelemetry}
				<div class="stat">
					<span class="lbl">Max Safe Linear Buffer Allocation:</span>
					<span class="val highlight">{memoryTelemetry.MaxSafeWasmAllocationMb} MB</span>
				</div>
			{/if}
			{#if egressTelemetry}
				<div class="stat">
					<span class="lbl">Outbound Internet Egress:</span>
					<span class="val status-tag" class:allowed={egressTelemetry.outboundAccess}
						>{egressTelemetry.outboundAccess ? 'OPEN' : 'FIREWALLED'}</span
					>
				</div>
				{#if egressTelemetry.pingMs !== undefined && egressTelemetry.pingMs !== -1}
					<div class="stat">
						<span class="lbl">Egress Network Latency:</span>
						<span class="val">{egressTelemetry.pingMs.toFixed(1)} ms</span>
					</div>
				{/if}
			{:else}
				<div class="shimmer">Measuring isolate boundary allowances...</div>
			{/if}
		</section>

		<section class="card">
			<h2>[05] MICROTASK CONCURRENCY MESH</h2>
			{#if concurrencyTelemetry}
				<div class="stat">
					<span class="lbl">Event Loop Scheduling Lag:</span>
					<span class="val text-green">{concurrencyTelemetry.eventLoopLagMs.toFixed(3)} ms</span>
				</div>
				<div class="stat">
					<span class="lbl">Sync Burn Capacity (20ms):</span>
					<span class="val highlight">{concurrencyTelemetry.syncBurnOps.toLocaleString()} ops</span>
				</div>
			{:else}
				<div class="shimmer">Evaluating microtask starvation ceilings...</div>
			{/if}
		</section>

		<section class="card client-card">
			<h2>[06] CLIENT DEVICE CORRELATION</h2>
			{#if clientTelemetry}
				<div class="stat">
					<span class="lbl">Logical Thread Pool:</span>
					<span class="val">{clientTelemetry.cores} Cores</span>
				</div>
				<div class="stat">
					<span class="lbl">Client GPU Canvas Core:</span>
					<span class="val text-cyan">{clientTelemetry.gpu.renderer}</span>
				</div>
				<div class="stat">
					<span class="lbl">WebGPU Support:</span>
					<span class="val">{clientTelemetry.webGPU ? 'Available' : 'Unavailable'}</span>
				</div>
			{/if}
		</section>
	</div>

	{#if streamHaltedUnexpectedly}
		<div class="alert-banner">
			⚠️ SERVERLESS STREAM TERMINATED: Container memory limit breached or CPU execution quota
			forcibly killed by hypervisor.
		</div>
	{/if}

	<footer class="terminal-footer">
		<button onclick={streamDiagnostics} disabled={streamActive}>
			{streamActive ? 'STRESSING PIPELINE...' : 'FORCE NEW INTERROGATION EXECUTION'}
		</button>
	</footer>
</main>

<style>
	:global(body) {
		background: #070709;
		color: #d1d5db;
		font-family: monospace;
	}
	.dashboard-root {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}
	.matrix-header {
		border-bottom: 1px solid #1f2937;
		padding-bottom: 1.5rem;
		margin-bottom: 2rem;
		position: relative;
	}
	.network-tag {
		position: absolute;
		right: 0;
		bottom: 1.5rem;
		font-size: 0.85rem;
		color: #6b7280;
	}
	.status-pulse {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 10px;
	}
	.status-pulse.active {
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
	}
	.status-pulse.idle {
		background: #ef4444;
	}
	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1.5rem;
	}
	.card {
		background: #0f1115;
		border: 1px solid #1f2937;
		padding: 1.5rem;
		border-radius: 4px;
	}
	.client-card {
		border-color: #06b6d4;
	}
	h2 {
		font-size: 0.9rem;
		color: #9ca3af;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}
	.stat {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.95rem;
	}
	.lbl {
		color: #6b7280;
	}
	.val {
		font-weight: bold;
	}
	.text-green {
		color: #10b981;
	}
	.text-cyan {
		color: #06b6d4;
	}
	.clear {
		color: #34d399;
	}
	.status-tag {
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 0.8rem;
		background: #374151;
	}
	.status-tag.allowed {
		background: #065f46;
		color: #34d399;
	}
	.warn {
		color: #f59e0b;
	}
	.highlight {
		color: #a855f7;
	}
	.shimmer {
		color: #4b5563;
		font-style: italic;
		animation: pulse 1.5s infinite;
	}
	.alert-banner {
		background: #7f1d1d;
		border: 1px solid #ef4444;
		color: #fca5a5;
		padding: 1rem;
		border-radius: 4px;
		margin-top: 2rem;
	}
	.terminal-footer {
		margin-top: 2rem;
		border-top: 1px solid #1f2937;
		padding-top: 1.5rem;
	}
	button {
		background: #111827;
		border: 1px solid #374151;
		color: #e5e7eb;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
		font-family: monospace;
	}
	button:hover:not(:disabled) {
		background: #1f2937;
		border-color: #4b5563;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
