<script lang="ts">
	import { gatherClientMetrics } from '$lib/client/hardware';
	import type {
		ClientHardwareMetrics,
		ClockChunk,
		ConcurrencyChunk,
		ContextLeakChunk,
		EgressChunk,
		EntropyChunk,
		EphemeralDiskChunk,
		IdentityChunk,
		JitChunk,
		MemoryChunk,
		SurveillanceChunk,
		WasmChunk
	} from '$lib/types';
	import { diagnosticStreamChunkSchema } from '$lib/types';
	import {
		Button,
		Column,
		Grid,
		InlineLoading,
		InlineNotification,
		Row,
		Tag,
		Tile
	} from 'carbon-components-svelte';
	import {
		Code,
		DataBase, // FIXED: Corrected lower-case 'b' casing string mismatch
		Flash,
		Laptop,
		Meter,
		Network_2,
		Play,
		Terminal,
		Timer,
		View, // INTEGRATED: Added native element tracker for the privacy panel
		VirtualMachine,
		Warning
	} from 'carbon-icons-svelte';
	import { onMount } from 'svelte';

	// DRY Unified Telemetry Matrix
	let telemetry = $state<{
		identity: IdentityChunk | null;
		clock: ClockChunk | null;
		wasm: WasmChunk | null;
		memory: MemoryChunk | null;
		egress: EgressChunk | null;
		concurrency: ConcurrencyChunk | null;
		contextLeak: ContextLeakChunk | null;
		jit: JitChunk | null;
		entropy: EntropyChunk | null;
		disk: EphemeralDiskChunk | null;
		surveillance: SurveillanceChunk | null;
		client: ClientHardwareMetrics | null;
	}>({
		identity: null,
		clock: null,
		wasm: null,
		memory: null,
		egress: null,
		concurrency: null,
		contextLeak: null,
		jit: null,
		entropy: null,
		disk: null,
		surveillance: null,
		client: null
	});

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

					const rawJson = JSON.parse(line);
					const result = diagnosticStreamChunkSchema.safeParse(rawJson);

					if (!result.success) continue;
					const chunk = result.data;

					if (chunk.type === 'panic') {
						throw new Error(chunk.data.message);
					}

					// 1. Exclude panic to ensure the key is safe to map to the telemetry object
					const targetKey = chunk.type as Exclude<typeof chunk.type, 'panic'>;

					// 2. Cast telemetry as a loose Record of those keys to bypass the single-line correlation strictness
					(telemetry as Record<typeof targetKey, typeof chunk.data>)[targetKey] = chunk.data;
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
		telemetry.client = await gatherClientMetrics();
		await streamDiagnostics();
	});

	// Linter Immunization bypassed cleanly by inspecting the root state object
	$effect(() => {
		void JSON.stringify(telemetry);
	});
</script>

<main class="carbon-dashboard-root">
	<Grid padding>
		<Row style="margin-bottom: 2rem; align-items: center;">
			<Column lg={8} md={6} sm={4}>
				<h1 class="dashboard-title">ISOLATE INTERROGATOR // SEC.SURVEILLANCE.MESH</h1>
				<p class="dashboard-subtitle">
					Real-time sandboxed telemetry stream, platform signature, and user tracking correlation.
				</p>
			</Column>
			<Column lg={4} md={2} sm={4} class="header-status-column">
				{#if networkLatency !== null}
					<Tag type="cyan" style="font-family: 'IBM Plex Mono', monospace;"
						>INGRESS RTT: {networkLatency}ms</Tag
					>
				{/if}
				<div class="status-indicator {streamActive ? 'streaming' : 'idle'}"></div>
			</Column>
		</Row>

		<Row style="row-gap: 1.5rem;">
			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[01] SERVER ISOLATE ENVIRONMENT</h4>
						<Terminal size={20} class="icon-server" />
					</div>
					{#if telemetry.identity}
						<div class="carbon-stat">
							Uptime: <strong>{telemetry.identity.uptimeMs.toFixed(1)} ms</strong>
						</div>
						<div class="carbon-stat">
							Activations: <strong class="text-green">{telemetry.identity.activations}</strong>
						</div>
						<div class="carbon-stat">
							Global Context: <strong>{telemetry.identity.globalKeysCount} primitives</strong>
						</div>
					{:else}
						<InlineLoading description="Awaiting stream connection..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[02] SIDE-CHANNEL CLOCK RESOLUTION</h4>
						<Timer size={20} class="icon-clock" />
					</div>
					{#if telemetry.clock}
						<div class="carbon-stat">
							Timer Resolution: <strong>{telemetry.clock.minIncrementMs.toFixed(5)} ms</strong>
						</div>
						<div class="carbon-stat">
							Spectre Mitigation Mask:
							<span
								class="text-highlight {telemetry.clock.isCoarsened ? 'text-red' : 'text-green'}"
							>
								{telemetry.clock.estimatedMitigationLevel}
							</span>
						</div>
					{:else}
						<InlineLoading description="Probing timing pipelines..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[03] WASM INTERPRETATION SANDBOX</h4>
						<Code size={20} class="icon-wasm" />
					</div>
					{#if telemetry.wasm}
						<div class="carbon-stat">
							Dynamic Compilation:
							<Tag type={telemetry.wasm.allowed ? 'green' : 'red'} style="margin: 0;">
								{telemetry.wasm.allowed ? 'UNRESTRICTED' : 'BLOCKED'}
							</Tag>
						</div>
						{#if telemetry.wasm.allowed}
							<div class="carbon-stat">
								JIT Compile Time: <strong>{telemetry.wasm.compileDurationMs.toFixed(3)} ms</strong>
							</div>
						{/if}
					{:else}
						<InlineLoading description="Testing byte compilation execution restrictions..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[04] BOUNDARY EXPLORATION & EGRESS</h4>
						<Network_2 size={20} class="icon-network" />
					</div>
					{#if telemetry.memory}
						<div class="carbon-stat">
							Max Safe WASM Allocation: <strong class="text-purple"
								>{telemetry.memory.MaxSafeWasmAllocationMb} MB</strong
							>
						</div>
					{/if}
					{#if telemetry.egress}
						<div class="carbon-stat">
							Outbound Internet Egress:
							<Tag type={telemetry.egress.outboundAccess ? 'green' : 'red'} style="margin: 0;">
								{telemetry.egress.outboundAccess ? 'OPEN' : 'FIREWALLED'}
							</Tag>
						</div>
						{#if telemetry.egress.pingMs !== -1}
							<div class="carbon-stat">
								Egress Network Latency: <strong>{telemetry.egress.pingMs.toFixed(1)} ms</strong>
							</div>
						{/if}
					{:else}
						<InlineLoading description="Measuring isolate boundary allowances..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[05] MICROTASK CONCURRENCY MESH</h4>
						<VirtualMachine size={20} class="icon-concurrency" />
					</div>
					{#if telemetry.concurrency}
						<div class="carbon-stat">
							Event Loop Scheduling Lag: <strong class="text-green"
								>{telemetry.concurrency.eventLoopLagMs.toFixed(3)} ms</strong
							>
						</div>
						<div class="carbon-stat">
							Sync Burn Capacity (20ms): <strong class="text-purple"
								>{telemetry.concurrency.syncBurnOps.toLocaleString()} ops</strong
							>
						</div>
					{:else}
						<InlineLoading description="Evaluating microtask starvation ceilings..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile tile-bleed">
					<div class="tile-header">
						<h4>[06] STATE POLLUTION / MULTI-TENANCY</h4>
						<Warning size={20} class="icon-bleed" />
					</div>
					{#if telemetry.contextLeak}
						<div class="carbon-stat">
							Isolate Memory Bleed:
							<Tag
								type={telemetry.contextLeak.contextIsPolluted ? 'red' : 'green'}
								style="margin: 0;"
							>
								{telemetry.contextLeak.contextIsPolluted ? 'DIRTY HEAP CACHE' : 'PURE ISOLATE'}
							</Tag>
						</div>
						<div class="carbon-stat">
							Current Node Tag: <span class="mono-token"
								>{telemetry.contextLeak.currentAssignedMarker}</span
							>
						</div>
					{:else}
						<InlineLoading description="Evaluating context security maps..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[07] ENGINE JIT PRIVILEGES</h4>
						<Flash size={20} class="icon-jit" />
					</div>
					{#if telemetry.jit}
						<div class="carbon-stat">
							Runtime Evaluation:
							<Tag type={telemetry.jit.dynamicEvalAllowed ? 'green' : 'red'} style="margin: 0;">
								{telemetry.jit.dynamicEvalAllowed ? 'ALLOWED' : 'BLOCKED'}
							</Tag>
						</div>
						{#if telemetry.jit.dynamicEvalAllowed}
							<div class="carbon-stat">
								Eval Execution Time: <strong>{telemetry.jit.evalDurationMs.toFixed(3)} ms</strong>
							</div>
						{/if}
					{:else}
						<InlineLoading description="Testing engine compilation policies..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[08] ENTROPY HARVESTING SPEED</h4>
						<Meter size={20} class="icon-entropy" />
					</div>
					{#if telemetry.entropy}
						<div class="carbon-stat">
							Entropy Yield Speed: <strong class="text-purple"
								>{telemetry.entropy.entropyGenerationRateMbSec.toFixed(2)} MB/s</strong
							>
						</div>
						<div class="carbon-stat">
							Harvest Ingress Lag: <strong>{telemetry.entropy.durationMs.toFixed(2)} ms</strong>
						</div>
					{:else}
						<InlineLoading description="Sourcing entropy seed rate..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile">
					<div class="tile-header">
						<h4>[09] EPHEMERAL DISK SUBSYSTEM</h4>
						<DataBase size={20} class="icon-disk" />
					</div>
					{#if telemetry.disk}
						<div class="carbon-stat">
							File System Layer:
							<Tag type={telemetry.disk.hasDiskAccess ? 'green' : 'red'} style="margin: 0;">
								{telemetry.disk.hasDiskAccess ? 'ACCESSIBLE' : 'SANDBOX LOCKOUT'}
							</Tag>
						</div>
						{#if telemetry.disk.hasDiskAccess}
							<div class="carbon-stat">
								Inferred Driver Base: <strong class="text-cyan">{telemetry.disk.diskType}</strong>
							</div>
							<div class="carbon-stat">
								256KB Write Latency: <strong>{telemetry.disk.writeLatencyMs.toFixed(2)} ms</strong>
							</div>
						{/if}
					{:else}
						<InlineLoading description="Interrogating disk storage vectors..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile tile-surveillance">
					<div class="tile-header">
						<h4>[10] NETWORK SURVEILLANCE MATRIX</h4>
						<View size={20} class="icon-surveillance" />
					</div>
					{#if telemetry.surveillance}
						<div class="carbon-stat">
							Leaked IP Gateway: <strong class="text-blue"
								>{telemetry.surveillance.clientIpHeaderLeaked}</strong
							>
						</div>
						<div class="carbon-stat">
							Proxy Routing Path: <strong
								>{telemetry.surveillance.proxyChainDetected ? 'MULTI-HOP' : 'DIRECT'}</strong
							>
						</div>
						<div class="carbon-stat">
							Privacy Vector: <strong class="text-cyan"
								>{telemetry.surveillance.anonymityScore}/100</strong
							>
						</div>
					{:else}
						<InlineLoading description="Deconstructing header footprints..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile tile-client">
					<div class="tile-header">
						<h4>[11] CLIENT DEVICE CORRELATION</h4>
						<Laptop size={20} class="icon-client" />
					</div>
					{#if telemetry.client}
						<div class="carbon-stat">
							Logical Thread Pool: <strong>{telemetry.client.cores} Cores</strong>
						</div>
						<div class="carbon-stat">
							Client GPU Canvas Core: <strong class="text-cyan"
								>{telemetry.client.gpu.renderer}</strong
							>
						</div>
						<div class="carbon-stat">
							WebGPU Support: <strong
								>{telemetry.client.webGPU ? 'Available' : 'Unavailable'}</strong
							>
						</div>
					{:else}
						<InlineLoading description="Gathering local device profiles..." />
					{/if}
				</Tile>
			</Column>

			<Column lg={4} md={4} sm={4}>
				<Tile class="telemetry-tile tile-command">
					<div class="tile-header">
						<h4>[12] TELEMETRY CORE CONTROLLER</h4>
						<Play size={20} class="icon-command" />
					</div>

					<div class="command-status-wrapper">
						<div class="carbon-stat">
							Pipeline State:
							<Tag type={streamActive ? 'green' : 'red'} style="margin: 0;">
								{streamActive ? 'STRESSING INTERROGATOR' : 'ENGINE IDLE'}
							</Tag>
						</div>
						<div class="carbon-stat">
							Gateway Ingress: <strong
								>{networkLatency !== null ? `${networkLatency} ms` : 'UNPROBED'}</strong
							>
						</div>
					</div>

					<Button
						onclick={streamDiagnostics}
						disabled={streamActive}
						kind="secondary"
						size="field"
						style="width: 100%; margin-top: 1rem; justify-content: space-between;"
					>
						{streamActive ? 'PROBING HEAP STACK...' : 'LAUNCH ADVERSARIAL INSPECTION'}
					</Button>
				</Tile>
			</Column>
		</Row>

		{#if streamHaltedUnexpectedly}
			<Row style="margin-top: 2rem;">
				<Column lg={12}>
					<InlineNotification
						kind="error"
						title="Isolate Execution Halted:"
						subtitle="Container memory limit breached, execution runtime hit a fatal uncaught exception, or CPU limits were enforced by the hypervisor."
						hideCloseButton
					/>
				</Column>
			</Row>
		{/if}
	</Grid>
</main>

<style>
	/* --- 1. CORE SYSTEM BACKDROP (ELEGANT LIGHTER GRAPHITE) --- */
	.carbon-dashboard-root {
		padding: 2.5rem 0;
		min-height: 100vh;
		/* Screen brightness elevated to a premium, highly legible dark graphite */
		background-color: #1a1a20;

		/* PERMANENT SCANLINE FIX: 
           By placing the scanline gradient directly inside the background stack, 
           it is trapped safely behind all text layers and Carbon elements.
        */
		background-image: linear-gradient(rgba(0, 0, 0, 0.18) 50%, transparent 50%);
		background-size: 100% 4px;

		color: var(--cds-text-primary, #f4f4f4);
		font-family: var(--cds-font-family-mono, monospace);
		letter-spacing: -0.01em;
	}

	/* Removed old ::after pseudo-element completely to kill text-blur bugs */

	/* --- 2. HEADER MATRIX & HORIZONTAL FLEX ALIGNMENT --- */
	.dashboard-title {
		font-size: 1.35rem;
		font-weight: 400;
		letter-spacing: 0.08em;
		color: var(--cds-text-primary, #f4f4f4);
		margin-bottom: 0.5rem;
	}

	.dashboard-subtitle {
		font-size: 0.75rem;
		color: #8d8d96; /* Brighter, text-matching contrast description */
		max-width: 650px;
		line-height: 1.5;
		letter-spacing: 0.02em;
	}

	/* Enforces pristine horizontal centering alignment for header metrics */
	:global(.header-status-column) {
		display: flex !important;
		align-items: center !important;
		justify-content: flex-end !important;
		gap: 1rem;
		height: 100%;
	}

	/* Beautiful live breathing status ring */
	.status-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		position: relative;
		flex-shrink: 0; /* Prevents layout squeezing */
	}

	.status-indicator.streaming {
		background-color: var(--cds-support-success, #24a148);
		box-shadow: 0 0 10px var(--cds-support-success, #24a148);
	}
	.status-indicator.streaming::before {
		content: '';
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border: 1px solid var(--cds-support-success, #24a148);
		border-radius: 50%;
		animation: radar-pulse 2s infinite cubic-bezier(0.16, 1, 0.3, 1);
	}

	.status-indicator.idle {
		background-color: var(--cds-support-error, #da1e28);
		box-shadow: 0 0 6px var(--cds-support-error, #da1e28);
	}

	/* --- 3. THE INTERROGATOR TELEMETRY TILES --- */
	:global(.telemetry-tile) {
		/* Adjusted layer to pop elegantly off the lighter background layout */
		background-color: #22222a !important;
		border: 1px solid rgba(255, 255, 255, 0.05) !important;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.5rem !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition:
			transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
			border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
	}

	:global(.telemetry-tile:hover) {
		transform: translateY(-2px);
		border-color: rgba(255, 255, 255, 0.15) !important;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.tile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* Clean solid line layout separation instead of messy dashed matrices */
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		padding-bottom: 0.75rem;
	}

	.tile-header h4 {
		font-size: 0.72rem;
		font-weight: 500;
		color: #a8a8a8;
		letter-spacing: 0.08em;
	}

	/* --- 4. SEMANTIC LAYOUT HIGHLIGHT PINS --- */
	:global(.tile-bleed) {
		border-left: 2px solid var(--cds-support-warning, #f1c21b) !important;
	}
	:global(.tile-surveillance) {
		border-left: 2px solid var(--cds-support-caution-major, #ff832b) !important;
	}
	:global(.tile-client) {
		border-left: 2px solid var(--cds-support-info, #0043ce) !important;
	}

	/* --- 5. COMPONENT ELEMENT STYLING --- */
	.carbon-stat {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		font-size: 0.82rem;
		color: #a8a8af; /* Boosted visibility for stat labels */
		padding: 0.35rem 0;
		gap: 1rem;
	}

	.carbon-stat :global(strong) {
		color: #ffffff;
		font-weight: 500;
	}

	.mono-token {
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: var(--cds-link-primary, #78a9ff);
		padding: 2px 6px;
		font-size: 0.75rem;
	}

	:global(.telemetry-tile .cds--inline-loading) {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: #8d8d8d;
	}

	/* Tech Glow Accents */
	:global(.icon-server) {
		color: #8d8d8d;
	}
	:global(.icon-clock) {
		color: #78a9ff;
		filter: drop-shadow(0 0 2px rgba(120, 169, 255, 0.2));
	}
	:global(.icon-wasm) {
		color: #42be65;
		filter: drop-shadow(0 0 2px rgba(66, 190, 101, 0.2));
	}
	:global(.icon-network) {
		color: #be95ff;
		filter: drop-shadow(0 0 2px rgba(190, 149, 255, 0.2));
	}
	:global(.icon-concurrency) {
		color: #4589ff;
	}
	:global(.icon-bleed) {
		color: #f1c21b;
	}
	:global(.icon-jit) {
		color: #f1c21b;
	}
	:global(.icon-entropy) {
		color: #be95ff;
	}
	:global(.icon-disk) {
		color: #f4f4f4;
	}
	:global(.icon-surveillance) {
		color: #ff832b;
		filter: drop-shadow(0 0 2px rgba(255, 131, 43, 0.2));
	}
	:global(.icon-client) {
		color: #4589ff;
		filter: drop-shadow(0 0 2px rgba(69, 137, 255, 0.2));
	}

	/* --- 6. UTILITY MATRIX COLORS --- */
	:global(.text-green) {
		color: #42be65 !important;
	}
	:global(.text-red) {
		color: #ff8389 !important;
	}
	:global(.text-purple) {
		color: #be95ff !important;
	}
	:global(.text-blue) {
		color: #4589ff !important;
	}
	:global(.text-cyan) {
		color: #78a9ff !important;
	}

	/* --- 7. RADAR INTERNET MONITOR ANIMATION --- */
	@keyframes radar-pulse {
		0% {
			transform: scale(0.9);
			opacity: 1;
		}
		100% {
			transform: scale(2.2);
			opacity: 0;
		}
	}
</style>
