<script lang="ts">
	import { telemetryEngine } from '$lib/client/telemetry.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import CyberMeter from '$lib/components/CyberMeter.svelte';
	import MetricRow from '$lib/components/MetricRow.svelte';
	import TelemetryTile from '$lib/components/TelemetryTile.svelte';
	import {
		Activity,
		Atom,
		Boxes,
		BrainCircuit,
		Check,
		CircleGauge,
		CircuitBoard,
		Copy,
		Cpu,
		Database,
		Download,
		FileCode2,
		Filter,
		Flame,
		GitFork,
		Globe,
		Grid3x3,
		KeyRound,
		Layers,
		MonitorPlay,
		Network,
		Play,
		Radar,
		Radio,
		RadioTower,
		RotateCcw,
		Satellite,
		ScanEye,
		ScanSearch,
		ShieldAlert,
		TriangleAlert,
		Waves,
		Waypoints
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	type DomainFilter = 'all' | 'server' | 'security' | 'crypto' | 'network' | 'client' | 'command';
	let activeDomain = $state<DomainFilter>('all');

	const domainFilters: { id: DomainFilter; label: string; count: number }[] = [
		{ id: 'all', label: 'ALL DOMAINS', count: 27 },
		{ id: 'server', label: 'SERVER ISOLATES', count: 7 },
		{ id: 'security', label: 'SECURITY & SPECTRE', count: 5 },
		{ id: 'crypto', label: 'WEBCRYPTO & ENTROPY', count: 2 },
		{ id: 'network', label: 'EGRESS & DNS', count: 3 },
		{ id: 'client', label: 'CLIENT FORENSICS', count: 9 },
		{ id: 'command', label: 'CONTROLLER', count: 1 }
	];

	function shouldShow(domain: DomainFilter) {
		return activeDomain === 'all' || activeDomain === domain;
	}

	function formatGpuRenderer(str: string): string {
		if (!str) return 'Unknown';
		const match = str.match(/ANGLE \(([^,]+),\s*([^,]+?)(?:\s+Direct3D|\s+OpenGL|\s+Vulkan|\))/i);
		if (match) {
			return `${match[1].trim()} ${match[2].trim()}`;
		}
		return str.length > 28 ? str.slice(0, 26) + '…' : str;
	}

	onMount(() => {
		void telemetryEngine.launch();
	});
</script>

<main class="scanline-bg min-h-screen px-4 py-8 sm:px-6 lg:px-12 text-zinc-100">
	<div class="mx-auto max-w-7xl">
		<!-- Tactical Header Matrix -->
		<header
			class="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-white/8 pb-6"
		>
			<div>
				<div class="flex items-center gap-2.5">
					<span
						class="inline-block size-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
					></span>
					<h1 class="font-mono text-lg font-semibold tracking-wider text-white sm:text-xl">
						ISOLATE INTERROGATOR <span class="text-zinc-600">//</span>
						<span class="text-cyan-300">SEC.SURVEILLANCE.MESH</span>
					</h1>
				</div>
				<p class="mt-1 text-xs text-zinc-400 font-mono tracking-wide">
					Adversarial benchmarking, microarchitectural side-channels, and multi-vector telemetry
					matrix.
				</p>
			</div>

			<!-- Tactical Actions Toolbar -->
			<div class="flex flex-wrap items-center gap-2.5">
				{#if telemetryEngine.networkLatency !== null}
					<Badge variant="cyan" class="font-mono font-bold">
						INGRESS RTT: {telemetryEngine.networkLatency}ms
					</Badge>
				{/if}

				<Badge variant={telemetryEngine.streamActive ? 'emerald' : 'zinc'} class="font-mono">
					VECTORS: {telemetryEngine.activeVectorCount}/{telemetryEngine.totalVectors}
				</Badge>

				<!-- Auto-Poll Toggle -->
				<button
					onclick={() => telemetryEngine.toggleAutoPoll()}
					class="flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] font-semibold transition-all cursor-pointer {telemetryEngine.autoPoll
						? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
						: 'bg-zinc-900/80 text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200'}"
					title="Toggle 3.5s continuous background telemetry interrogation"
				>
					<RotateCcw size={12} class={telemetryEngine.autoPoll ? 'animate-spin' : ''} />
					{telemetryEngine.autoPoll ? 'AUTO-POLL: ON' : 'AUTO-POLL: OFF'}
				</button>

				<!-- Export JSON Trace -->
				<button
					onclick={() => telemetryEngine.exportTrace()}
					class="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 bg-zinc-900/80 font-mono text-[11px] font-medium text-zinc-300 transition-all hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-200 hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
					title="Download full forensic JSON telemetry snapshot"
				>
					<Download size={12} class="text-cyan-400" />
					EXPORT TRACE
				</button>

				<!-- Copy Report -->
				<button
					onclick={() => void telemetryEngine.copySummary()}
					class="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 bg-zinc-900/80 font-mono text-[11px] font-medium text-zinc-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-emerald-200 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
					title="Copy markdown diagnostic summary to clipboard"
				>
					{#if telemetryEngine.copied}
						<Check size={12} class="text-emerald-400" />
						<span class="text-emerald-300 font-semibold">COPIED!</span>
					{:else}
						<Copy size={12} class="text-zinc-400" />
						COPY REPORT
					{/if}
				</button>

				<!-- Radar Pulse Indicator -->
				<div class="relative flex items-center justify-center p-1">
					<span
						class="size-2.5 rounded-full transition-colors {telemetryEngine.streamActive
							? 'bg-emerald-400 shadow-[0_0_10px_#10b981] radar-live'
							: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'}"
					></span>
				</div>
			</div>
		</header>

		<!-- Domain Category Filters -->
		<nav
			class="mb-6 flex flex-wrap items-center gap-2 border-b border-white/8 pb-4"
			aria-label="Filter vectors by domain"
		>
			<span class="text-xs font-mono text-zinc-500 mr-2 flex items-center gap-1.5 font-semibold">
				<Filter size={13} class="text-cyan-400" /> DOMAIN:
			</span>
			{#each domainFilters as filter (filter.id)}
				<button
					onclick={() => (activeDomain = filter.id)}
					class="px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer {activeDomain ===
					filter.id
						? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
						: 'bg-zinc-900/70 text-zinc-400 border border-white/10 hover:border-white/25 hover:text-zinc-200'}"
				>
					{filter.label} <span class="text-[10px] opacity-75">({filter.count})</span>
				</button>
			{/each}
		</nav>

		<!-- Telemetry Matrix Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			<!-- [01] SERVER ISOLATE ENVIRONMENT -->
			{#if shouldShow('server')}
				<TelemetryTile
					title="[01] Server Isolate Base"
					icon={BrainCircuit}
					variant="server"
					loading={!telemetryEngine.telemetry.identity}
				>
					{#if telemetryEngine.telemetry.identity}
						<MetricRow
							label="Uptime"
							value="{telemetryEngine.telemetry.identity.uptimeMs.toFixed(1)} ms"
							tooltip="Serverless isolate continuous uptime since cold instantiation."
						/>
						<MetricRow
							label="Activations"
							value={telemetryEngine.telemetry.identity.activations}
							valueClass="text-emerald-300 font-bold"
							tooltip="Number of requests handled by this specific isolate instance."
						/>
						<MetricRow
							label="Global Scope"
							value="{telemetryEngine.telemetry.identity.globalKeysCount} keys"
							tooltip="Total primitive objects and runtime globals detected in globalThis."
						/>
						<CyberMeter
							value={Math.min(100, Math.round(telemetryEngine.telemetry.identity.uptimeMs / 5))}
							max={100}
							variant="emerald"
							label="Isolate Longevity"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [02] CLOUD HYPERVISOR & REGION -->
			{#if shouldShow('server')}
				<TelemetryTile
					title="[02] Cloud Platform & Region"
					icon={Satellite}
					variant="server"
					loading={!telemetryEngine.telemetry.cloudMetadata}
				>
					{#if telemetryEngine.telemetry.cloudMetadata}
						<MetricRow
							label="Platform"
							value={telemetryEngine.telemetry.cloudMetadata.platform}
							valueClass="text-sky-300 font-semibold text-[11px] text-right"
							tooltip="Detected serverless execution environment and runtime host."
						/>
						<MetricRow
							label="Region"
							value={telemetryEngine.telemetry.cloudMetadata.region}
							valueClass="text-emerald-300 font-semibold"
							tooltip="Cloud edge gateway deployment point of presence (PoP)."
						/>
						<MetricRow
							label="Arch / Engine"
							value={telemetryEngine.telemetry.cloudMetadata.architecture}
							valueClass="text-zinc-200 text-[11px] text-right"
							tooltip="Underlying container architecture (x64/arm64) and V8/Node engine."
						/>
						<CyberMeter value={100} max={100} variant="emerald" label="Hypervisor Integrity" />
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [03] ISOLATE LIFECYCLE & COLD START -->
			{#if shouldShow('server')}
				<TelemetryTile
					title="[03] Lifecycle & Heap Delta"
					icon={Boxes}
					variant="server"
					loading={!telemetryEngine.telemetry.isolateLifecycle}
				>
					{#if telemetryEngine.telemetry.isolateLifecycle}
						<MetricRow
							label="Execution State"
							tooltip="Cold boot indicates a freshly initialized isolate; warm indicates cached runtime reuse."
						>
							<Badge
								variant={telemetryEngine.telemetry.isolateLifecycle.isColdStart
									? 'purple'
									: 'emerald'}
							>
								{telemetryEngine.telemetry.isolateLifecycle.isColdStart
									? 'COLD BOOT'
									: 'WARM ISOLATE'}
							</Badge>
						</MetricRow>
						<MetricRow
							label="Heap Allocated"
							value="{telemetryEngine.telemetry.isolateLifecycle.heapUsedMb} / {telemetryEngine
								.telemetry.isolateLifecycle.heapTotalMb} MB"
							valueClass="text-teal-300 font-semibold"
							tooltip="Current V8 heap memory consumption versus total allocated heap ceiling."
						/>
						<MetricRow
							label="Instance Tag"
							value="#{telemetryEngine.telemetry.isolateLifecycle.instanceId.slice(0, 10)}"
							valueClass="text-zinc-300 font-mono text-[11px]"
							tooltip="Ephemeral cryptographic instance identifier for tracking isolate reuse."
						/>
						<CyberMeter
							value={telemetryEngine.telemetry.isolateLifecycle.heapUsedMb}
							max={telemetryEngine.telemetry.isolateLifecycle.heapTotalMb}
							variant="emerald"
							showValue
							unit=" MB"
							label="V8 Heap Usage"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [04] SPECTRE ATTACK SURFACE -->
			{#if shouldShow('security')}
				<TelemetryTile
					title="[04] Spectre Side-Channels"
					icon={ShieldAlert}
					variant="security"
					loading={!telemetryEngine.telemetry.spectrePrimitives}
				>
					{#if telemetryEngine.telemetry.spectrePrimitives}
						<MetricRow
							label="Attack Surface"
							tooltip="Composite vulnerability score based on high-precision timer and memory sharing primitives."
						>
							<Badge
								variant={telemetryEngine.telemetry.spectrePrimitives.vulnerabilityProfile ===
								'Hardened'
									? 'emerald'
									: telemetryEngine.telemetry.spectrePrimitives.vulnerabilityProfile ===
										  'Elevated Risk'
										? 'rose'
										: 'amber'}
							>
								{telemetryEngine.telemetry.spectrePrimitives.vulnerabilityProfile}
							</Badge>
						</MetricRow>
						<MetricRow
							label="SharedArrayBuffer"
							value={telemetryEngine.telemetry.spectrePrimitives.hasSharedArrayBuffer
								? 'Exposed'
								: 'Protected'}
							valueClass={telemetryEngine.telemetry.spectrePrimitives.hasSharedArrayBuffer
								? 'text-rose-300 font-semibold'
								: 'text-emerald-300 font-semibold'}
							tooltip="High-precision shared memory buffer required for microarchitectural Spectre side-channels."
						/>
						<MetricRow
							label="WASM SIMD128"
							value={telemetryEngine.telemetry.spectrePrimitives.hasWasmSimd
								? 'Active'
								: 'Disabled'}
							valueClass={telemetryEngine.telemetry.spectrePrimitives.hasWasmSimd
								? 'text-cyan-300 font-semibold'
								: 'text-zinc-500'}
							tooltip="128-bit SIMD vector instructions providing high-throughput parallel execution."
						/>
						<CyberMeter
							value={telemetryEngine.telemetry.spectrePrimitives.vulnerabilityProfile === 'Hardened'
								? 15
								: telemetryEngine.telemetry.spectrePrimitives.vulnerabilityProfile ===
									  'Elevated Risk'
									? 85
									: 50}
							max={100}
							variant={telemetryEngine.telemetry.spectrePrimitives.vulnerabilityProfile ===
							'Hardened'
								? 'emerald'
								: 'rose'}
							label="Speculation Vulnerability"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [05] SIDE-CHANNEL CLOCK RESOLUTION -->
			{#if shouldShow('security')}
				<TelemetryTile
					title="[05] Clock Resolution & Jitter"
					icon={Radar}
					variant="security"
					loading={!telemetryEngine.telemetry.clock}
				>
					{#if telemetryEngine.telemetry.clock}
						<MetricRow
							label="Timer Precision"
							value="{telemetryEngine.telemetry.clock.minIncrementMs.toFixed(5)} ms"
							valueClass="text-zinc-100 font-bold"
							tooltip="Minimum measurable tick on performance.now; coarsened by hypervisors to prevent timing attacks."
						/>
						<MetricRow
							label="Mitigation Level"
							tooltip="Estimated level of Spectre clock coarsening and jitter injection."
						>
							<span
								class={telemetryEngine.telemetry.clock.isCoarsened
									? 'text-rose-300 font-semibold'
									: 'text-emerald-300 font-semibold'}
							>
								{telemetryEngine.telemetry.clock.estimatedMitigationLevel}
							</span>
						</MetricRow>
						<CyberMeter
							value={telemetryEngine.telemetry.clock.isCoarsened ? 90 : 15}
							max={100}
							variant={telemetryEngine.telemetry.clock.isCoarsened ? 'rose' : 'emerald'}
							label="Hypervisor Clamping"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [06] MICROARCHITECTURAL CACHE JITTER -->
			{#if shouldShow('server')}
				<TelemetryTile
					title="[06] Microarchitectural Cache"
					icon={Waves}
					variant="server"
					loading={!telemetryEngine.telemetry.cacheJitter}
				>
					{#if telemetryEngine.telemetry.cacheJitter}
						<MetricRow
							label="L1/L2 Mean Stride"
							value="{telemetryEngine.telemetry.cacheJitter.l1L2AccessTimeNs} ns"
							valueClass="text-indigo-300 font-semibold"
							tooltip="Pointer-chasing strided memory latency measuring L1/L2 cache read speed."
						/>
						<MetricRow
							label="Jitter Variance"
							value="{(telemetryEngine.telemetry.cacheJitter.varianceRatio * 100).toFixed(1)}%"
							valueClass={telemetryEngine.telemetry.cacheJitter.varianceRatio > 0.3
								? 'text-amber-300 font-semibold'
								: 'text-emerald-300 font-semibold'}
							tooltip="Statistical latency variance ratio across multiple memory cache sweeps."
						/>
						<CyberMeter
							value={Math.min(
								100,
								Math.round(telemetryEngine.telemetry.cacheJitter.varianceRatio * 100)
							)}
							max={100}
							variant={telemetryEngine.telemetry.cacheJitter.varianceRatio > 0.3
								? 'amber'
								: 'emerald'}
							showValue
							unit="%"
							label="Cache Timing Spread"
						/>
						<MetricRow
							label="Neighbor Activity"
							value={telemetryEngine.telemetry.cacheJitter.noisyNeighborActivity}
							valueClass="text-zinc-200"
							tooltip="Interference heuristic evaluating noisy neighbor CPU core contention."
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [07] WEBCRYPTO THROUGHPUT -->
			{#if shouldShow('crypto')}
				<TelemetryTile
					title="[07] WebCrypto Encryption"
					icon={KeyRound}
					variant="crypto"
					loading={!telemetryEngine.telemetry.cryptoBench}
				>
					{#if telemetryEngine.telemetry.cryptoBench}
						<MetricRow
							label="SHA-256 Digest"
							value="{telemetryEngine.telemetry.cryptoBench.sha256ThroughputMbSec} MB/s"
							valueClass="text-emerald-300 font-semibold"
							tooltip="Hardware-accelerated native WebCrypto SHA-256 hashing throughput."
						/>
						<MetricRow
							label="AES-GCM 256"
							value="{telemetryEngine.telemetry.cryptoBench.aesGcmThroughputMbSec} MB/s"
							valueClass="text-teal-300 font-semibold"
							tooltip="AES-GCM 256-bit symmetric encryption throughput rate."
						/>
						<MetricRow
							label="KeyGen Latency"
							value="{telemetryEngine.telemetry.cryptoBench.keyGenLatencyMs} ms"
							valueClass="text-zinc-200"
							tooltip="Time required to generate an authenticated 256-bit AES-GCM crypto key."
						/>
						<CyberMeter
							value={Math.min(100, telemetryEngine.telemetry.cryptoBench.sha256ThroughputMbSec)}
							max={100}
							variant="teal"
							label="Crypto Silicon Acceleration"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [08] STATE POLLUTION / MULTI-TENANCY -->
			{#if shouldShow('security')}
				<TelemetryTile
					title="[08] State Pollution Bleed"
					icon={GitFork}
					variant="bleed"
					loading={!telemetryEngine.telemetry.contextLeak}
				>
					{#if telemetryEngine.telemetry.contextLeak}
						<MetricRow
							label="Isolate Bleed"
							tooltip="Detects cross-request global state and memory bleed between isolate invocations."
						>
							<Badge
								variant={telemetryEngine.telemetry.contextLeak.contextIsPolluted
									? 'rose'
									: 'emerald'}
							>
								{telemetryEngine.telemetry.contextLeak.contextIsPolluted
									? 'DIRTY HEAP'
									: 'PURE ISOLATE'}
							</Badge>
						</MetricRow>
						<MetricRow
							label="Assigned Marker"
							tooltip="Unique per-request marker token injected into the runtime heap."
						>
							<span
								class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-cyan-300 border border-cyan-500/30"
							>
								{telemetryEngine.telemetry.contextLeak.currentAssignedMarker}
							</span>
						</MetricRow>
						<CyberMeter
							value={telemetryEngine.telemetry.contextLeak.contextIsPolluted ? 90 : 5}
							max={100}
							variant={telemetryEngine.telemetry.contextLeak.contextIsPolluted ? 'rose' : 'emerald'}
							label="Heap Isolation Purity"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [09] ENGINE JIT PRIVILEGES -->
			{#if shouldShow('security')}
				<TelemetryTile
					title="[09] Engine JIT Privileges"
					icon={Activity}
					variant="security"
					loading={!telemetryEngine.telemetry.jit}
				>
					{#if telemetryEngine.telemetry.jit}
						<MetricRow
							label="Dynamic Eval"
							tooltip="Evaluates whether eval() and new Function() dynamic code execution is permitted."
						>
							<Badge
								variant={telemetryEngine.telemetry.jit.dynamicEvalAllowed ? 'emerald' : 'rose'}
							>
								{telemetryEngine.telemetry.jit.dynamicEvalAllowed ? 'ALLOWED' : 'BLOCKED'}
							</Badge>
						</MetricRow>
						{#if telemetryEngine.telemetry.jit.dynamicEvalAllowed}
							<MetricRow
								label="Eval Speed"
								value="{telemetryEngine.telemetry.jit.evalDurationMs.toFixed(3)} ms"
								valueClass="text-zinc-200 font-semibold"
								tooltip="Execution latency of dynamically evaluated JIT code."
							/>
						{/if}
						<CyberMeter
							value={telemetryEngine.telemetry.jit.dynamicEvalAllowed ? 85 : 10}
							max={100}
							variant={telemetryEngine.telemetry.jit.dynamicEvalAllowed ? 'emerald' : 'rose'}
							label="JIT Dynamic Code Exec"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [10] HYPERVISOR ENTROPY HARVESTING -->
			{#if shouldShow('crypto')}
				<TelemetryTile
					title="[10] Entropy Harvest Speed"
					icon={Atom}
					variant="crypto"
					loading={!telemetryEngine.telemetry.entropy}
				>
					{#if telemetryEngine.telemetry.entropy}
						<MetricRow
							label="Entropy Yield"
							value="{telemetryEngine.telemetry.entropy.entropyGenerationRateMbSec.toFixed(2)} MB/s"
							valueClass="text-purple-300 font-semibold"
							tooltip="CSPRNG random byte generation throughput via crypto.getRandomValues."
						/>
						<MetricRow
							label="Harvest Latency"
							value="{telemetryEngine.telemetry.entropy.durationMs.toFixed(2)} ms"
							valueClass="text-zinc-200"
							tooltip="Duration required to harvest 64KB of cryptographically secure random entropy."
						/>
						<CyberMeter
							value={Math.min(
								100,
								Math.round(telemetryEngine.telemetry.entropy.entropyGenerationRateMbSec * 2)
							)}
							max={100}
							variant="purple"
							showValue
							unit=" MB/s"
							label="CSPRNG Generation Speed"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [11] WASM INTERPRETATION SANDBOX -->
			{#if shouldShow('security')}
				<TelemetryTile
					title="[11] WASM Sandbox Bounds"
					icon={CircuitBoard}
					variant="security"
					loading={!telemetryEngine.telemetry.wasm}
				>
					{#if telemetryEngine.telemetry.wasm}
						<MetricRow
							label="Compilation"
							tooltip="Permission state for dynamic WebAssembly module compilation."
						>
							<Badge variant={telemetryEngine.telemetry.wasm.allowed ? 'emerald' : 'rose'}>
								{telemetryEngine.telemetry.wasm.allowed ? 'UNRESTRICTED' : 'BLOCKED'}
							</Badge>
						</MetricRow>
						{#if telemetryEngine.telemetry.wasm.allowed}
							<MetricRow
								label="Compile Time"
								value="{telemetryEngine.telemetry.wasm.compileDurationMs.toFixed(3)} ms"
								valueClass="text-indigo-300 font-semibold"
								tooltip="JIT compilation duration for standard WASM binary module."
							/>
						{/if}
						{#if telemetryEngine.telemetry.memory}
							<MetricRow
								label="Max WASM Heap"
								value="{telemetryEngine.telemetry.memory.MaxSafeWasmAllocationMb} MB"
								valueClass="text-purple-300 font-semibold"
								tooltip="Maximum allocatable WebAssembly memory pages before hitting runtime limits."
							/>
						{/if}
						<CyberMeter
							value={telemetryEngine.telemetry.wasm.allowed ? 90 : 10}
							max={100}
							variant="indigo"
							label="WASM Execution Engine"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [12] SERIALIZATION & HEAP STRESS -->
			{#if shouldShow('server')}
				<TelemetryTile
					title="[12] Serialization Stress"
					icon={FileCode2}
					variant="server"
					loading={!telemetryEngine.telemetry.serializationStress}
				>
					{#if telemetryEngine.telemetry.serializationStress}
						<MetricRow
							label="JSON Throughput"
							value="{telemetryEngine.telemetry.serializationStress.jsonThroughputMbSec} MB/s"
							valueClass="text-amber-300 font-semibold"
							tooltip="V8 JSON.stringify and JSON.parse throughput under heap stress."
						/>
						<MetricRow
							label="Structured Clone"
							value="{telemetryEngine.telemetry.serializationStress.structuredCloneLatencyMs} ms"
							valueClass="text-zinc-100 font-semibold"
							tooltip="Execution latency for deep structuredClone object graph replication."
						/>
						<MetricRow
							label="Payload Scale"
							value="{Math.round(
								telemetryEngine.telemetry.serializationStress.payloadSizeBytes / 1024
							)} KB"
							valueClass="text-zinc-300"
							tooltip="Total byte scale of serialized diagnostic object payloads."
						/>
						<CyberMeter
							value={Math.min(
								100,
								Math.round(telemetryEngine.telemetry.serializationStress.jsonThroughputMbSec / 2)
							)}
							max={100}
							variant="amber"
							label="V8 Serialization Pipeline"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [13] EPHEMERAL DISK SUBSYSTEM -->
			{#if shouldShow('server')}
				<TelemetryTile
					title="[13] Ephemeral Disk Medium"
					icon={Database}
					variant="server"
					loading={!telemetryEngine.telemetry.disk}
				>
					{#if telemetryEngine.telemetry.disk}
						<MetricRow
							label="File System"
							tooltip="Checks whether local writable container disk storage (/tmp) is accessible."
						>
							<Badge variant={telemetryEngine.telemetry.disk.hasDiskAccess ? 'emerald' : 'rose'}>
								{telemetryEngine.telemetry.disk.hasDiskAccess ? 'ACCESSIBLE' : 'SANDBOXED'}
							</Badge>
						</MetricRow>
						{#if telemetryEngine.telemetry.disk.hasDiskAccess}
							<MetricRow
								label="Storage Type"
								value={telemetryEngine.telemetry.disk.diskType === 'Persistent/Ephemeral Physical'
									? 'Physical Disk'
									: telemetryEngine.telemetry.disk.diskType}
								valueClass="text-cyan-300 font-semibold text-right"
								tooltip="Inferred filesystem medium: {telemetryEngine.telemetry.disk.diskType}."
							/>
							<MetricRow
								label="256KB Write"
								value="{telemetryEngine.telemetry.disk.writeLatencyMs.toFixed(2)} ms"
								valueClass="text-zinc-200"
								tooltip="Synchronous disk write and flush latency for a 256KB payload."
							/>
						{/if}
						<CyberMeter
							value={telemetryEngine.telemetry.disk.hasDiskAccess ? 85 : 15}
							max={100}
							variant="emerald"
							label="Disk I/O Write Capacity"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [14] BOUNDARY EXPLORATION & EGRESS -->
			{#if shouldShow('network')}
				<TelemetryTile
					title="[14] Outbound Egress Pipeline"
					icon={Globe}
					variant="network"
					loading={!telemetryEngine.telemetry.egress}
				>
					{#if telemetryEngine.telemetry.egress}
						<MetricRow
							label="Internet Egress"
							tooltip="Outbound internet egress firewall status from inside the edge isolate."
						>
							<Badge variant={telemetryEngine.telemetry.egress.outboundAccess ? 'emerald' : 'rose'}>
								{telemetryEngine.telemetry.egress.outboundAccess ? 'OPEN' : 'FIREWALLED'}
							</Badge>
						</MetricRow>
						{#if telemetryEngine.telemetry.egress.pingMs !== -1}
							<MetricRow
								label="Gateway Ping"
								value="{telemetryEngine.telemetry.egress.pingMs.toFixed(1)} ms"
								valueClass="text-cyan-300 font-semibold"
								tooltip="Round-trip latency to edge gateway egress endpoint."
							/>
						{/if}
						<CyberMeter
							value={telemetryEngine.telemetry.egress.outboundAccess ? 100 : 0}
							max={100}
							variant={telemetryEngine.telemetry.egress.outboundAccess ? 'emerald' : 'rose'}
							label="Egress Pipe Integrity"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [15] MULTI-RESOLVER EGRESS MESH -->
			{#if shouldShow('network')}
				<TelemetryTile
					title="[15] Multi-Resolver DNS Mesh"
					icon={RadioTower}
					variant="network"
					loading={!telemetryEngine.telemetry.multiEgressMatrix}
				>
					{#if telemetryEngine.telemetry.multiEgressMatrix}
						<MetricRow
							label="Cloudflare (1.1.1.1)"
							value="{telemetryEngine.telemetry.multiEgressMatrix.cloudflareDnsMs} ms"
							valueClass="text-orange-300 font-semibold"
							tooltip="Concurrent HEAD resolution latency to Cloudflare 1.1.1.1 DNS."
						/>
						<MetricRow
							label="Google (8.8.8.8)"
							value="{telemetryEngine.telemetry.multiEgressMatrix.googleDnsMs} ms"
							valueClass="text-sky-300 font-semibold"
							tooltip="Concurrent HEAD resolution latency to Google 8.8.8.8 DNS."
						/>
						<MetricRow
							label="Quad9 (9.9.9.9)"
							value="{telemetryEngine.telemetry.multiEgressMatrix.quad9DnsMs} ms"
							valueClass="text-purple-300 font-semibold"
							tooltip="Concurrent HEAD resolution latency to Quad9 9.9.9.9 DNS."
						/>
						<CyberMeter
							value={Math.max(
								5,
								Math.min(
									100,
									100 - (telemetryEngine.telemetry.multiEgressMatrix.cloudflareDnsMs || 40)
								)
							)}
							max={100}
							variant="cyan"
							label="DNS Mesh Latency Index"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [16] NETWORK SURVEILLANCE MATRIX -->
			{#if shouldShow('network')}
				<TelemetryTile
					title="[16] Network Surveillance"
					icon={ScanSearch}
					variant="surveillance"
					loading={!telemetryEngine.telemetry.surveillance}
				>
					{#if telemetryEngine.telemetry.surveillance}
						<MetricRow
							label="Client IP Header"
							value={telemetryEngine.telemetry.surveillance.clientIpHeaderLeaked}
							valueClass="text-sky-300 font-semibold text-right"
							tooltip="Edge proxy headers revealing true client IP address."
						/>
						<MetricRow
							label="Routing Path"
							value={telemetryEngine.telemetry.surveillance.proxyChainDetected
								? 'MULTI-HOP'
								: 'DIRECT'}
							valueClass="text-zinc-200"
							tooltip="Detected edge reverse proxy hop hierarchy (Direct ingress vs multi-layer CDN routing)."
						/>
						<MetricRow
							label="Privacy Index"
							value="{telemetryEngine.telemetry.surveillance.anonymityScore}/100"
							valueClass="text-cyan-300 font-bold"
							tooltip="Composite edge privacy score evaluating proxy header exposure and routing hops."
						/>
						<CyberMeter
							value={telemetryEngine.telemetry.surveillance.anonymityScore}
							max={100}
							variant="cyan"
							showValue
							unit="/100"
							label="Anonymity Index"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [17] MICROTASK CONCURRENCY MESH -->
			{#if shouldShow('server')}
				<TelemetryTile
					title="[17] Concurrency & Event Loop"
					icon={CircleGauge}
					variant="server"
					loading={!telemetryEngine.telemetry.concurrency}
				>
					{#if telemetryEngine.telemetry.concurrency}
						<MetricRow
							label="Event Loop Lag"
							value="{telemetryEngine.telemetry.concurrency.eventLoopLagMs.toFixed(3)} ms"
							valueClass="text-emerald-300 font-semibold"
							tooltip="Microtask queue scheduling lag indicating main thread CPU contention."
						/>
						<MetricRow
							label="Sync 20ms Burn"
							value="{telemetryEngine.telemetry.concurrency.syncBurnOps.toLocaleString()} ops"
							valueClass="text-purple-300 font-semibold"
							tooltip="Number of tight synchronous arithmetic loop iterations executed in a 20ms burst."
						/>
						<CyberMeter
							value={Math.max(
								5,
								Math.min(
									100,
									Math.round(100 - telemetryEngine.telemetry.concurrency.eventLoopLagMs * 20)
								)
							)}
							max={100}
							variant="emerald"
							label="Scheduler Responsiveness"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [18] CLIENT PRIVACY & DEVICE MATRIX -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[18] Client Privacy Matrix"
					icon={ScanEye}
					variant="client"
					loading={!telemetryEngine.telemetry.client}
				>
					{#if telemetryEngine.telemetry.client}
						<MetricRow
							label="Cores / Threads"
							value="{telemetryEngine.telemetry.client.cores} Cores"
							valueClass="text-zinc-200 font-semibold"
							tooltip="Logical CPU hardware concurrency cores exposed to clientside JavaScript."
						/>
						<MetricRow
							label="Audio Farbling"
							value={telemetryEngine.telemetry.client.audio.isAudioFarbled
								? 'FARBLE ACTIVE'
								: 'UNALTERED'}
							valueClass={telemetryEngine.telemetry.client.audio.isAudioFarbled
								? 'text-amber-300 font-semibold'
								: 'text-zinc-400 font-semibold'}
							tooltip="Anti-fingerprinting protection injecting sub-perceptual floating-point noise into Web Audio oscillators."
						/>
						<MetricRow
							label="System Fonts"
							value="{telemetryEngine.telemetry.client.fonts.detectedFontCount} detected"
							valueClass="text-teal-300 font-semibold"
							tooltip="Detected local installed font metrics probed via canvas font measurement side-channel."
						/>
						<MetricRow
							label="GPU Renderer"
							value={formatGpuRenderer(telemetryEngine.telemetry.client.gpu.renderer)}
							valueClass="text-cyan-300 font-semibold text-right text-[11px]"
							tooltip="Unmasked WebGL GPU Renderer: {telemetryEngine.telemetry.client.gpu.renderer}"
						/>
						<CyberMeter
							value={telemetryEngine.telemetry.client.fonts.detectedFontCount > 10 ? 75 : 25}
							max={100}
							variant="teal"
							label="Entropic Footprint"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [19] CLIENT HINTS (UA-CH) -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[19] Client Hints (UA-CH)"
					icon={Cpu}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.clientHints}
				>
					{#if telemetryEngine.telemetry.client?.clientHints}
						<MetricRow
							label="Platform"
							value={telemetryEngine.telemetry.client.clientHints.platform}
							valueClass="text-sky-300 font-semibold"
							tooltip="Client operating system platform reported by User-Agent Client Hints."
						/>
						<MetricRow
							label="Architecture"
							value={telemetryEngine.telemetry.client.clientHints.architecture}
							valueClass="text-zinc-100 font-semibold"
							tooltip="High-entropy CPU architecture data exposed via navigator.userAgentData."
						/>
						<MetricRow
							label="Bitness"
							value="{telemetryEngine.telemetry.client.clientHints.bitness}-bit"
							valueClass="text-emerald-300 font-semibold"
							tooltip="Reported processor bitness (64-bit or 32-bit)."
						/>
						<CyberMeter value={100} max={100} variant="teal" label="UA-CH Client Fidelity" />
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [20] NETWORK INFORMATION API -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[20] Network Connection API"
					icon={Radio}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.connection}
				>
					{#if telemetryEngine.telemetry.client?.connection}
						<MetricRow
							label="Effective Type"
							value={telemetryEngine.telemetry.client.connection.effectiveType}
							valueClass="text-cyan-300 font-bold"
							tooltip="Inferred cellular/broadband connection generation (e.g. 4g, 5g, wifi)."
						/>
						<MetricRow
							label="Downlink Speed"
							value="{telemetryEngine.telemetry.client.connection.downlinkMb} MB/s"
							valueClass="text-emerald-300 font-semibold"
							tooltip="Estimated downlink bandwidth throughput provided by Network Information API."
						/>
						<MetricRow
							label="Client RTT"
							value="{telemetryEngine.telemetry.client.connection.rttMs} ms"
							valueClass="text-zinc-200"
							tooltip="Estimated round-trip time latency for client connection."
						/>
						<CyberMeter
							value={Math.min(
								100,
								Math.round((telemetryEngine.telemetry.client.connection.downlinkMb || 10) * 8)
							)}
							max={100}
							variant="cyan"
							label="Downlink Saturation"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [21] SUBRESOURCE TIMING BREAKDOWN -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[21] Subresource Timing"
					icon={Layers}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.resourceTiming}
				>
					{#if telemetryEngine.telemetry.client?.resourceTiming}
						<MetricRow
							label="Subresources"
							value="{telemetryEngine.telemetry.client.resourceTiming.subresourceCount} assets"
							valueClass="text-zinc-200 font-semibold"
							tooltip="Total subresource network entries recorded via PerformanceResourceTiming."
						/>
						<MetricRow
							label="Mean TTFB"
							value="{telemetryEngine.telemetry.client.resourceTiming.avgTtfbMs} ms"
							valueClass="text-teal-300 font-semibold"
							tooltip="Average Time to First Byte across loaded scripts, styles, and fetch requests."
						/>
						<MetricRow
							label="Total Transferred"
							value="{telemetryEngine.telemetry.client.resourceTiming.totalTransferKb} KB"
							valueClass="text-cyan-300 font-semibold"
							tooltip="Cumulative encoded byte transfer volume for page assets."
						/>
						<CyberMeter
							value={Math.min(
								100,
								telemetryEngine.telemetry.client.resourceTiming.subresourceCount * 4
							)}
							max={100}
							variant="teal"
							label="Resource Pipeline Density"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [22] WEBRTC ICE GATHERING -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[22] WebRTC ICE Discovery"
					icon={Network}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.webrtc}
				>
					{#if telemetryEngine.telemetry.client?.webrtc}
						<MetricRow
							label="STUN Gathering"
							value="{telemetryEngine.telemetry.client.webrtc.iceGatheringDurationMs} ms"
							valueClass="text-purple-300 font-semibold"
							tooltip="Interactive Connectivity Establishment (ICE) candidate gathering duration."
						/>
						<MetricRow
							label="Candidates"
							value="{telemetryEngine.telemetry.client.webrtc.candidateCount} detected"
							valueClass="text-emerald-300 font-semibold"
							tooltip="Discovered network interface candidates (host, server reflexive srflx, relay)."
						/>
						<MetricRow
							label="Candidate Types"
							value={telemetryEngine.telemetry.client.webrtc.candidateTypes.join(', ')}
							valueClass="text-zinc-200 font-semibold text-right"
							tooltip="List of discovered ICE network routing candidate protocols."
						/>
						<CyberMeter
							value={Math.min(100, telemetryEngine.telemetry.client.webrtc.candidateCount * 25)}
							max={100}
							variant="purple"
							label="ICE Route Candidates"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [23] NETWORK PACKET & PING JITTER -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[23] Network Packet Jitter"
					icon={Flame}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.networkJitter}
				>
					{#if telemetryEngine.telemetry.client?.networkJitter}
						<MetricRow
							label="Ping Jitter"
							value="{telemetryEngine.telemetry.client.networkJitter.pingJitterMs} ms"
							valueClass="text-sky-300 font-semibold"
							tooltip="Standard deviation of packet round-trip times across multi-sample ping sweep."
						/>
						<MetricRow
							label="Ping Range"
							value="{telemetryEngine.telemetry.client.networkJitter.minPingMs} - {telemetryEngine
								.telemetry.client.networkJitter.maxPingMs} ms"
							valueClass="text-zinc-200"
							tooltip="Minimum and maximum recorded ping round-trip times."
						/>
						<MetricRow
							label="Stability Rating"
							value={telemetryEngine.telemetry.client.networkJitter.packetStability}
							valueClass="text-emerald-300 font-semibold text-right"
							tooltip="Packet timing consistency rating evaluating jitter stability."
						/>
						<CyberMeter
							value={Math.max(
								10,
								Math.min(
									100,
									Math.round(100 - telemetryEngine.telemetry.client.networkJitter.pingJitterMs * 10)
								)
							)}
							max={100}
							variant="cyan"
							label="Line Stability Index"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [24] LONG TASKS & MAIN THREAD LAG -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[24] Long Tasks & Thread Lag"
					icon={TriangleAlert}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.longTasks}
				>
					{#if telemetryEngine.telemetry.client?.longTasks}
						<MetricRow
							label="Long Tasks (>50ms)"
							tooltip="PerformanceObserver monitoring main thread task stalls exceeding 50ms."
						>
							<Badge
								variant={telemetryEngine.telemetry.client.longTasks.longTaskCount === 0
									? 'emerald'
									: 'rose'}
							>
								{telemetryEngine.telemetry.client.longTasks.longTaskCount} BLOCKS
							</Badge>
						</MetricRow>
						<MetricRow
							label="Max Duration"
							value="{telemetryEngine.telemetry.client.longTasks.maxTaskDurationMs} ms"
							valueClass="text-rose-300 font-semibold"
							tooltip="Duration of the single longest blocking main-thread stall."
						/>
						<MetricRow
							label="Total Blocking Time"
							value="{telemetryEngine.telemetry.client.longTasks.totalBlockingTimeMs} ms"
							valueClass="text-amber-300 font-semibold"
							tooltip="Cumulative main thread stall duration across all long tasks."
						/>
						<CyberMeter
							value={Math.min(100, telemetryEngine.telemetry.client.longTasks.totalBlockingTimeMs)}
							max={100}
							variant={telemetryEngine.telemetry.client.longTasks.longTaskCount === 0
								? 'emerald'
								: 'rose'}
							showValue
							unit=" ms"
							label="Thread Total Blocking Time"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [25] rAF REFRESH & FRAME DROPS -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[25] rAF Refresh & Frame Drops"
					icon={MonitorPlay}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.frameTiming}
				>
					{#if telemetryEngine.telemetry.client?.frameTiming}
						<MetricRow
							label="Target Display"
							value="{telemetryEngine.telemetry.client.frameTiming.estimatedRefreshRateHz} Hz"
							valueClass="text-amber-300 font-bold"
							tooltip="Inferred physical display panel refresh rate (60Hz, 120Hz, 144Hz, 240Hz)."
						/>
						<MetricRow
							label="Realtime FPS"
							value="{telemetryEngine.telemetry.client.frameTiming.realtimeFps} FPS"
							valueClass="text-emerald-300 font-bold"
							tooltip="Measured real-time rendering frame rate over 40 sampled animation ticks."
						/>
						<MetricRow
							label="Dropped Frames"
							value={telemetryEngine.telemetry.client.frameTiming.droppedFrames}
							valueClass={telemetryEngine.telemetry.client.frameTiming.droppedFrames > 0
								? 'text-rose-300 font-semibold'
								: 'text-zinc-400'}
							tooltip="Count of dropped or delayed animation frames exceeding the frame interval threshold."
						/>
						<CyberMeter
							value={Math.round(telemetryEngine.telemetry.client.frameTiming.realtimeFps)}
							max={telemetryEngine.telemetry.client.frameTiming.estimatedRefreshRateHz || 60}
							variant={telemetryEngine.telemetry.client.frameTiming.droppedFrames > 0
								? 'amber'
								: 'emerald'}
							showValue
							unit=" FPS"
							label="Compositor Rendering FPS"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [26] DOM LAYOUT THRASHING BENCHMARK -->
			{#if shouldShow('client')}
				<TelemetryTile
					title="[26] DOM Layout Thrashing"
					icon={Grid3x3}
					variant="client"
					loading={!telemetryEngine.telemetry.client?.layoutThrashing}
				>
					{#if telemetryEngine.telemetry.client?.layoutThrashing}
						<MetricRow
							label="Reflow Throughput"
							value="{telemetryEngine.telemetry.client.layoutThrashing.opsPerSec.toLocaleString()} ops/s"
							valueClass="text-orange-300 font-bold"
							tooltip="Forced synchronous layout calculation throughput under high DOM mutation pressure."
						/>
						<MetricRow
							label="Mean Reflow Time"
							value="{telemetryEngine.telemetry.client.layoutThrashing.avgReflowMs} ms"
							valueClass="text-zinc-100 font-semibold"
							tooltip="Average duration per forced synchronous reflow style recalculation."
						/>
						<MetricRow
							label="Benchmark Run"
							value="{telemetryEngine.telemetry.client.layoutThrashing.totalBenchmarkMs} ms"
							valueClass="text-zinc-300"
							tooltip="Total duration for 50 forced layout calculation benchmark iterations."
						/>
						<CyberMeter
							value={Math.min(
								100,
								Math.round(telemetryEngine.telemetry.client.layoutThrashing.opsPerSec / 80)
							)}
							max={100}
							variant="orange"
							label="Layout Mutation Speed"
						/>
					{/if}
				</TelemetryTile>
			{/if}

			<!-- [27] TELEMETRY CORE CONTROLLER -->
			{#if shouldShow('command')}
				<TelemetryTile title="[27] Telemetry Controller" icon={Waypoints} variant="command">
					<div class="space-y-2">
						<MetricRow
							label="Engine Status"
							tooltip="Real-time execution status of the serverless NDJSON stream pipeline."
						>
							<Badge variant={telemetryEngine.streamActive ? 'emerald' : 'zinc'}>
								{telemetryEngine.streamActive ? 'INTERROGATING' : 'IDLE'}
							</Badge>
						</MetricRow>
						<MetricRow
							label="Gateway Latency"
							value={telemetryEngine.networkLatency !== null
								? `${telemetryEngine.networkLatency} ms`
								: 'UNPROBED'}
							valueClass="text-cyan-300 font-bold"
							tooltip="Measured initial handshake round-trip latency to the edge diagnostic gateway."
						/>
						<CyberMeter
							value={telemetryEngine.streamActive ? 100 : 0}
							max={100}
							variant="cyan"
							label="NDJSON Stream Active"
						/>
					</div>

					<button
						onclick={() => telemetryEngine.launch()}
						disabled={telemetryEngine.streamActive}
						class="mt-4 flex w-full items-center justify-between rounded border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 font-mono text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all hover:border-cyan-500/60 hover:bg-cyan-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
					>
						<span
							>{telemetryEngine.streamActive
								? 'PROBING RUNTIME STACK...'
								: 'LAUNCH ADVERSARIAL INSPECTION'}</span
						>
						<Play size={14} class="fill-current" />
					</button>
				</TelemetryTile>
			{/if}
		</div>

		<!-- Failure Banner -->
		{#if telemetryEngine.streamHaltedUnexpectedly}
			<div
				class="mt-8 flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 font-mono text-xs"
			>
				<TriangleAlert size={18} class="shrink-0 text-rose-400 mt-0.5" />
				<div>
					<h5 class="font-semibold text-rose-300">Isolate Execution Halted</h5>
					<p class="mt-0.5 text-rose-400/80">
						{telemetryEngine.errorMessage ||
							'Container memory limit breached, execution runtime hit a fatal uncaught exception, or CPU limits were enforced by the hypervisor.'}
					</p>
				</div>
			</div>
		{/if}
	</div>
</main>
