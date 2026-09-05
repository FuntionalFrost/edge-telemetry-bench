<script lang="ts">
	import { gatherClientMetrics } from '$lib/client/hardware';
	import Badge from '$lib/components/Badge.svelte';
	import TelemetryTile from '$lib/components/TelemetryTile.svelte';
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
		TriangleAlert,
		CodeXml,
		Cpu,
		Eye,
		Gauge,
		HardDrive,
		Laptop,
		Network,
		Play,
		ShieldAlert,
		Terminal,
		Timer,
		Zap
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	// Reactive Telemetry Matrix State
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

					const targetKey = chunk.type as Exclude<typeof chunk.type, 'panic'>;
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

	$effect(() => {
		void JSON.stringify(telemetry);
	});
</script>

<main class="scanline-bg min-h-screen px-4 py-8 sm:px-6 lg:px-12 text-zinc-100">
	<div class="mx-auto max-w-7xl">
		<!-- Header Matrix -->
		<header
			class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6"
		>
			<div>
				<div class="flex items-center gap-2.5">
					<span
						class="inline-block size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
					></span>
					<h1 class="font-mono text-lg font-medium tracking-wider text-white sm:text-xl">
						ISOLATE INTERROGATOR <span class="text-zinc-500">//</span>
						<span class="text-cyan-400">SEC.SURVEILLANCE.MESH</span>
					</h1>
				</div>
				<p class="mt-1 text-xs text-zinc-400 font-mono tracking-wide">
					Real-time sandboxed telemetry stream, platform signature, and user tracking correlation.
				</p>
			</div>

			<div class="flex items-center gap-3 self-start sm:self-auto">
				{#if networkLatency !== null}
					<Badge variant="cyan" class="font-mono">
						INGRESS RTT: {networkLatency}ms
					</Badge>
				{/if}

				<div class="relative flex items-center justify-center p-1">
					<span
						class="size-2.5 rounded-full transition-colors {streamActive
							? 'bg-emerald-500 shadow-[0_0_10px_#10b981] radar-live'
							: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'}"
					></span>
				</div>
			</div>
		</header>

		<!-- Telemetry Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<!-- [01] SERVER ISOLATE ENVIRONMENT -->
			<TelemetryTile
				title="[01] Server Isolate Environment"
				icon={Terminal}
				iconClass="text-zinc-400"
				loading={!telemetry.identity}
				loadingText="Awaiting stream connection..."
			>
				{#if telemetry.identity}
					<div class="flex justify-between py-0.5">
						<span>Uptime:</span>
						<strong class="text-white">{telemetry.identity.uptimeMs.toFixed(1)} ms</strong>
					</div>
					<div class="flex justify-between py-0.5">
						<span>Activations:</span>
						<strong class="text-emerald-400">{telemetry.identity.activations}</strong>
					</div>
					<div class="flex justify-between py-0.5">
						<span>Global Context:</span>
						<strong class="text-white">{telemetry.identity.globalKeysCount} primitives</strong>
					</div>
				{/if}
			</TelemetryTile>

			<!-- [02] SIDE-CHANNEL CLOCK RESOLUTION -->
			<TelemetryTile
				title="[02] Side-Channel Clock Resolution"
				icon={Timer}
				iconClass="text-cyan-400"
				loading={!telemetry.clock}
				loadingText="Probing timing pipelines..."
			>
				{#if telemetry.clock}
					<div class="flex justify-between py-0.5">
						<span>Timer Resolution:</span>
						<strong class="text-white">{telemetry.clock.minIncrementMs.toFixed(5)} ms</strong>
					</div>
					<div class="flex items-center justify-between py-0.5">
						<span>Spectre Mitigation:</span>
						<span
							class={telemetry.clock.isCoarsened
								? 'text-rose-400 font-medium'
								: 'text-emerald-400 font-medium'}
						>
							{telemetry.clock.estimatedMitigationLevel}
						</span>
					</div>
				{/if}
			</TelemetryTile>

			<!-- [03] WASM INTERPRETATION SANDBOX -->
			<TelemetryTile
				title="[03] WASM Interpretation Sandbox"
				icon={CodeXml}
				iconClass="text-emerald-400"
				loading={!telemetry.wasm}
				loadingText="Testing byte compilation restrictions..."
			>
				{#if telemetry.wasm}
					<div class="flex items-center justify-between py-0.5">
						<span>Dynamic Compilation:</span>
						<Badge variant={telemetry.wasm.allowed ? 'emerald' : 'rose'}>
							{telemetry.wasm.allowed ? 'UNRESTRICTED' : 'BLOCKED'}
						</Badge>
					</div>
					{#if telemetry.wasm.allowed}
						<div class="flex justify-between py-0.5">
							<span>JIT Compile Time:</span>
							<strong class="text-white">{telemetry.wasm.compileDurationMs.toFixed(3)} ms</strong>
						</div>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [04] BOUNDARY EXPLORATION & EGRESS -->
			<TelemetryTile
				title="[04] Boundary Exploration & Egress"
				icon={Network}
				iconClass="text-purple-400"
				loading={!telemetry.egress}
				loadingText="Measuring isolate boundary allowances..."
			>
				{#if telemetry.memory}
					<div class="flex justify-between py-0.5">
						<span>Max Safe WASM Allocation:</span>
						<strong class="text-purple-400">{telemetry.memory.MaxSafeWasmAllocationMb} MB</strong>
					</div>
				{/if}
				{#if telemetry.egress}
					<div class="flex items-center justify-between py-0.5">
						<span>Outbound Egress:</span>
						<Badge variant={telemetry.egress.outboundAccess ? 'emerald' : 'rose'}>
							{telemetry.egress.outboundAccess ? 'OPEN' : 'FIREWALLED'}
						</Badge>
					</div>
					{#if telemetry.egress.pingMs !== -1}
						<div class="flex justify-between py-0.5">
							<span>Egress Latency:</span>
							<strong class="text-white">{telemetry.egress.pingMs.toFixed(1)} ms</strong>
						</div>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [05] MICROTASK CONCURRENCY MESH -->
			<TelemetryTile
				title="[05] Microtask Concurrency Mesh"
				icon={Cpu}
				iconClass="text-blue-400"
				loading={!telemetry.concurrency}
				loadingText="Evaluating microtask starvation ceilings..."
			>
				{#if telemetry.concurrency}
					<div class="flex justify-between py-0.5">
						<span>Event Loop Lag:</span>
						<strong class="text-emerald-400"
							>{telemetry.concurrency.eventLoopLagMs.toFixed(3)} ms</strong
						>
					</div>
					<div class="flex justify-between py-0.5">
						<span>Sync Burn (20ms):</span>
						<strong class="text-purple-400"
							>{telemetry.concurrency.syncBurnOps.toLocaleString()} ops</strong
						>
					</div>
				{/if}
			</TelemetryTile>

			<!-- [06] STATE POLLUTION / MULTI-TENANCY -->
			<TelemetryTile
				title="[06] State Pollution / Multi-Tenancy"
				icon={ShieldAlert}
				iconClass="text-amber-400"
				variant="bleed"
				loading={!telemetry.contextLeak}
				loadingText="Evaluating context security maps..."
			>
				{#if telemetry.contextLeak}
					<div class="flex items-center justify-between py-0.5">
						<span>Isolate Memory Bleed:</span>
						<Badge variant={telemetry.contextLeak.contextIsPolluted ? 'rose' : 'emerald'}>
							{telemetry.contextLeak.contextIsPolluted ? 'DIRTY HEAP CACHE' : 'PURE ISOLATE'}
						</Badge>
					</div>
					<div class="flex items-center justify-between py-0.5">
						<span>Node Instance:</span>
						<span
							class="rounded bg-white/5 px-1.5 py-0.5 text-[11px] font-mono text-cyan-400 border border-white/10"
						>
							{telemetry.contextLeak.currentAssignedMarker}
						</span>
					</div>
				{/if}
			</TelemetryTile>

			<!-- [07] ENGINE JIT PRIVILEGES -->
			<TelemetryTile
				title="[07] Engine JIT Privileges"
				icon={Zap}
				iconClass="text-amber-400"
				loading={!telemetry.jit}
				loadingText="Testing engine compilation policies..."
			>
				{#if telemetry.jit}
					<div class="flex items-center justify-between py-0.5">
						<span>Runtime Evaluation:</span>
						<Badge variant={telemetry.jit.dynamicEvalAllowed ? 'emerald' : 'rose'}>
							{telemetry.jit.dynamicEvalAllowed ? 'ALLOWED' : 'BLOCKED'}
						</Badge>
					</div>
					{#if telemetry.jit.dynamicEvalAllowed}
						<div class="flex justify-between py-0.5">
							<span>Eval Execution:</span>
							<strong class="text-white">{telemetry.jit.evalDurationMs.toFixed(3)} ms</strong>
						</div>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [08] ENTROPY HARVESTING SPEED -->
			<TelemetryTile
				title="[08] Entropy Harvesting Speed"
				icon={Gauge}
				iconClass="text-purple-400"
				loading={!telemetry.entropy}
				loadingText="Sourcing entropy seed rate..."
			>
				{#if telemetry.entropy}
					<div class="flex justify-between py-0.5">
						<span>Entropy Yield:</span>
						<strong class="text-purple-400"
							>{telemetry.entropy.entropyGenerationRateMbSec.toFixed(2)} MB/s</strong
						>
					</div>
					<div class="flex justify-between py-0.5">
						<span>Harvest Lag:</span>
						<strong class="text-white">{telemetry.entropy.durationMs.toFixed(2)} ms</strong>
					</div>
				{/if}
			</TelemetryTile>

			<!-- [09] EPHEMERAL DISK SUBSYSTEM -->
			<TelemetryTile
				title="[09] Ephemeral Disk Subsystem"
				icon={HardDrive}
				iconClass="text-zinc-300"
				loading={!telemetry.disk}
				loadingText="Interrogating disk storage vectors..."
			>
				{#if telemetry.disk}
					<div class="flex items-center justify-between py-0.5">
						<span>File System:</span>
						<Badge variant={telemetry.disk.hasDiskAccess ? 'emerald' : 'rose'}>
							{telemetry.disk.hasDiskAccess ? 'ACCESSIBLE' : 'SANDBOX LOCKOUT'}
						</Badge>
					</div>
					{#if telemetry.disk.hasDiskAccess}
						<div class="flex justify-between py-0.5">
							<span>Driver Base:</span>
							<strong class="text-cyan-400">{telemetry.disk.diskType}</strong>
						</div>
						<div class="flex justify-between py-0.5">
							<span>256KB Write:</span>
							<strong class="text-white">{telemetry.disk.writeLatencyMs.toFixed(2)} ms</strong>
						</div>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [10] NETWORK SURVEILLANCE MATRIX -->
			<TelemetryTile
				title="[10] Network Surveillance Matrix"
				icon={Eye}
				iconClass="text-orange-400"
				variant="surveillance"
				loading={!telemetry.surveillance}
				loadingText="Deconstructing header footprints..."
			>
				{#if telemetry.surveillance}
					<div class="flex justify-between py-0.5">
						<span>Client IP Gateway:</span>
						<strong class="text-blue-400">{telemetry.surveillance.clientIpHeaderLeaked}</strong>
					</div>
					<div class="flex justify-between py-0.5">
						<span>Proxy Routing Path:</span>
						<strong class="text-white"
							>{telemetry.surveillance.proxyChainDetected ? 'MULTI-HOP' : 'DIRECT'}</strong
						>
					</div>
					<div class="flex justify-between py-0.5">
						<span>Privacy Vector:</span>
						<strong class="text-cyan-400">{telemetry.surveillance.anonymityScore}/100</strong>
					</div>
				{/if}
			</TelemetryTile>

			<!-- [11] CLIENT DEVICE CORRELATION -->
			<TelemetryTile
				title="[11] Client Device Correlation"
				icon={Laptop}
				iconClass="text-blue-400"
				variant="client"
				loading={!telemetry.client}
				loadingText="Gathering local device profiles..."
			>
				{#if telemetry.client}
					<div class="flex justify-between py-0.5">
						<span>Logical Cores:</span>
						<strong class="text-white">{telemetry.client.cores} Threads</strong>
					</div>
					<div class="flex justify-between py-0.5">
						<span>GPU Renderer:</span>
						<strong class="text-cyan-400 truncate max-w-42.5" title={telemetry.client.gpu.renderer}>
							{telemetry.client.gpu.renderer}
						</strong>
					</div>
					<div class="flex justify-between py-0.5">
						<span>WebGPU API:</span>
						<strong class={telemetry.client.webGPU ? 'text-emerald-400' : 'text-zinc-500'}>
							{telemetry.client.webGPU ? 'Available' : 'Unavailable'}
						</strong>
					</div>
				{/if}
			</TelemetryTile>

			<!-- [12] TELEMETRY CORE CONTROLLER -->
			<TelemetryTile
				title="[12] Telemetry Core Controller"
				icon={Play}
				iconClass="text-cyan-400"
				variant="command"
			>
				<div class="space-y-2">
					<div class="flex items-center justify-between py-0.5">
						<span>Engine State:</span>
						<Badge variant={streamActive ? 'emerald' : 'zinc'}>
							{streamActive ? 'INTERROGATING' : 'IDLE'}
						</Badge>
					</div>
					<div class="flex justify-between py-0.5">
						<span>Gateway Ingress:</span>
						<strong class="text-white"
							>{networkLatency !== null ? `${networkLatency} ms` : 'UNPROBED'}</strong
						>
					</div>
				</div>

				<button
					onclick={streamDiagnostics}
					disabled={streamActive}
					class="mt-4 flex w-full items-center justify-between rounded border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 font-mono text-xs font-semibold text-cyan-400 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
				>
					<span>{streamActive ? 'PROBING HEAP STACK...' : 'LAUNCH ADVERSARIAL INSPECTION'}</span>
					<Play size={14} class="fill-current" />
				</button>
			</TelemetryTile>
		</div>

		<!-- Failure Banner -->
		{#if streamHaltedUnexpectedly}
			<div
				class="mt-8 flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 font-mono text-xs"
			>
				<TriangleAlert size={18} class="shrink-0 text-rose-400 mt-0.5" />
				<div>
					<h5 class="font-semibold text-rose-300">Isolate Execution Halted</h5>
					<p class="mt-0.5 text-rose-400/80">
						Container memory limit breached, execution runtime hit a fatal uncaught exception, or
						CPU limits were enforced by the hypervisor.
					</p>
				</div>
			</div>
		{/if}
	</div>
</main>
