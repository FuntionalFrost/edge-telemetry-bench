<script lang="ts">
	import { telemetryEngine } from '$lib/client/telemetry.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import MetricRow from '$lib/components/MetricRow.svelte';
	import TelemetryTile from '$lib/components/TelemetryTile.svelte';
	import {
		Activity,
		Boxes,
		Cloud,
		CodeXml,
		Cpu,
		Eye,
		Gauge,
		Globe,
		HardDrive,
		KeyRound,
		Laptop,
		Network,
		Play,
		Shield,
		ShieldAlert,
		Terminal,
		Timer,
		TriangleAlert,
		Zap
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		void telemetryEngine.launch();
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
					Adversarial benchmarking, side-channel timing limits, and client privacy correlation
					matrix.
				</p>
			</div>

			<div class="flex items-center gap-3 self-start sm:self-auto">
				{#if telemetryEngine.networkLatency !== null}
					<Badge variant="cyan" class="font-mono">
						INGRESS RTT: {telemetryEngine.networkLatency}ms
					</Badge>
				{/if}

				<Badge variant={telemetryEngine.streamActive ? 'emerald' : 'zinc'} class="font-mono">
					ACTIVE VECTORS: {telemetryEngine.activeVectorCount}/18
				</Badge>

				<div class="relative flex items-center justify-center p-1">
					<span
						class="size-2.5 rounded-full transition-colors {telemetryEngine.streamActive
							? 'bg-emerald-500 shadow-[0_0_10px_#10b981] radar-live'
							: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'}"
					></span>
				</div>
			</div>
		</header>

		<!-- Telemetry Matrix Grid (18 Probes + Client Matrix + Core Controller) -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			<!-- [01] SERVER ISOLATE ENVIRONMENT -->
			<TelemetryTile
				title="[01] Server Isolate Base"
				icon={Terminal}
				iconClass="text-zinc-400"
				loading={!telemetryEngine.telemetry.identity}
			>
				{#if telemetryEngine.telemetry.identity}
					<MetricRow
						label="Uptime"
						value="{telemetryEngine.telemetry.identity.uptimeMs.toFixed(1)} ms"
					/>
					<MetricRow
						label="Activations"
						value={telemetryEngine.telemetry.identity.activations}
						valueClass="text-emerald-400"
					/>
					<MetricRow
						label="Global Scope"
						value="{telemetryEngine.telemetry.identity.globalKeysCount} primitives"
					/>
				{/if}
			</TelemetryTile>

			<!-- [02] CLOUD HYPERVISOR & REGION -->
			<TelemetryTile
				title="[02] Cloud Platform & Region"
				icon={Cloud}
				iconClass="text-sky-400"
				loading={!telemetryEngine.telemetry.cloudMetadata}
			>
				{#if telemetryEngine.telemetry.cloudMetadata}
					<MetricRow
						label="Platform"
						value={telemetryEngine.telemetry.cloudMetadata.platform}
						valueClass="text-sky-400 truncate max-w-36"
					/>
					<MetricRow
						label="Region"
						value={telemetryEngine.telemetry.cloudMetadata.region}
						valueClass="text-emerald-400"
					/>
					<MetricRow
						label="Arch / Engine"
						value={telemetryEngine.telemetry.cloudMetadata.architecture}
						valueClass="text-zinc-300 truncate max-w-36"
					/>
				{/if}
			</TelemetryTile>

			<!-- [03] ISOLATE LIFECYCLE & COLD START -->
			<TelemetryTile
				title="[03] Lifecycle & Heap Delta"
				icon={Activity}
				iconClass="text-teal-400"
				loading={!telemetryEngine.telemetry.isolateLifecycle}
			>
				{#if telemetryEngine.telemetry.isolateLifecycle}
					<MetricRow label="Execution State">
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
						valueClass="text-teal-300"
					/>
					<MetricRow
						label="Instance Tag"
						value={telemetryEngine.telemetry.isolateLifecycle.instanceId.slice(0, 14)}
						valueClass="text-zinc-400"
					/>
				{/if}
			</TelemetryTile>

			<!-- [04] SPECTRE ATTACK SURFACE -->
			<TelemetryTile
				title="[04] Spectre Side-Channels"
				icon={Shield}
				iconClass="text-rose-400"
				loading={!telemetryEngine.telemetry.spectrePrimitives}
			>
				{#if telemetryEngine.telemetry.spectrePrimitives}
					<MetricRow label="Attack Surface">
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
							? 'text-rose-400'
							: 'text-emerald-400'}
					/>
					<MetricRow
						label="WASM SIMD128"
						value={telemetryEngine.telemetry.spectrePrimitives.hasWasmSimd ? 'Active' : 'Disabled'}
						valueClass={telemetryEngine.telemetry.spectrePrimitives.hasWasmSimd
							? 'text-cyan-400'
							: 'text-zinc-500'}
					/>
				{/if}
			</TelemetryTile>

			<!-- [05] SIDE-CHANNEL CLOCK RESOLUTION -->
			<TelemetryTile
				title="[05] Clock Resolution & Jitter"
				icon={Timer}
				iconClass="text-cyan-400"
				loading={!telemetryEngine.telemetry.clock}
			>
				{#if telemetryEngine.telemetry.clock}
					<MetricRow
						label="Timer Precision"
						value="{telemetryEngine.telemetry.clock.minIncrementMs.toFixed(5)} ms"
					/>
					<MetricRow label="Mitigation Level">
						<span
							class={telemetryEngine.telemetry.clock.isCoarsened
								? 'text-rose-400 font-medium'
								: 'text-emerald-400 font-medium'}
						>
							{telemetryEngine.telemetry.clock.estimatedMitigationLevel}
						</span>
					</MetricRow>
				{/if}
			</TelemetryTile>

			<!-- [06] MICROARCHITECTURAL CACHE JITTER -->
			<TelemetryTile
				title="[06] Microarchitectural Cache"
				icon={Cpu}
				iconClass="text-indigo-400"
				loading={!telemetryEngine.telemetry.cacheJitter}
			>
				{#if telemetryEngine.telemetry.cacheJitter}
					<MetricRow
						label="L1/L2 Mean Stride"
						value="{telemetryEngine.telemetry.cacheJitter.l1L2AccessTimeNs} ns"
						valueClass="text-indigo-300"
					/>
					<MetricRow
						label="Jitter Variance"
						value="{(telemetryEngine.telemetry.cacheJitter.varianceRatio * 100).toFixed(1)}%"
						valueClass={telemetryEngine.telemetry.cacheJitter.varianceRatio > 0.3
							? 'text-amber-400'
							: 'text-emerald-400'}
					/>
					<MetricRow
						label="Neighbor Activity"
						value={telemetryEngine.telemetry.cacheJitter.noisyNeighborActivity}
						valueClass="text-zinc-300 truncate max-w-32"
					/>
				{/if}
			</TelemetryTile>

			<!-- [07] WEBCRYPTO THROUGHPUT -->
			<TelemetryTile
				title="[07] WebCrypto Encryption"
				icon={KeyRound}
				iconClass="text-emerald-400"
				loading={!telemetryEngine.telemetry.cryptoBench}
			>
				{#if telemetryEngine.telemetry.cryptoBench}
					<MetricRow
						label="SHA-256 Digest"
						value="{telemetryEngine.telemetry.cryptoBench.sha256ThroughputMbSec} MB/s"
						valueClass="text-emerald-400"
					/>
					<MetricRow
						label="AES-GCM 256"
						value="{telemetryEngine.telemetry.cryptoBench.aesGcmThroughputMbSec} MB/s"
						valueClass="text-teal-400"
					/>
					<MetricRow
						label="KeyGen Latency"
						value="{telemetryEngine.telemetry.cryptoBench.keyGenLatencyMs} ms"
						valueClass="text-zinc-300"
					/>
				{/if}
			</TelemetryTile>

			<!-- [08] STATE POLLUTION / MULTI-TENANCY -->
			<TelemetryTile
				title="[08] State Pollution Bleed"
				icon={ShieldAlert}
				iconClass="text-amber-400"
				variant="bleed"
				loading={!telemetryEngine.telemetry.contextLeak}
			>
				{#if telemetryEngine.telemetry.contextLeak}
					<MetricRow label="Isolate Bleed">
						<Badge
							variant={telemetryEngine.telemetry.contextLeak.contextIsPolluted ? 'rose' : 'emerald'}
						>
							{telemetryEngine.telemetry.contextLeak.contextIsPolluted
								? 'DIRTY HEAP'
								: 'PURE ISOLATE'}
						</Badge>
					</MetricRow>
					<MetricRow label="Assigned Marker">
						<span
							class="rounded bg-white/5 px-1 py-0.5 text-[10px] text-cyan-400 border border-white/10"
						>
							{telemetryEngine.telemetry.contextLeak.currentAssignedMarker}
						</span>
					</MetricRow>
				{/if}
			</TelemetryTile>

			<!-- [09] ENGINE JIT PRIVILEGES -->
			<TelemetryTile
				title="[09] Engine JIT Privileges"
				icon={Zap}
				iconClass="text-amber-400"
				loading={!telemetryEngine.telemetry.jit}
			>
				{#if telemetryEngine.telemetry.jit}
					<MetricRow label="Dynamic Eval">
						<Badge variant={telemetryEngine.telemetry.jit.dynamicEvalAllowed ? 'emerald' : 'rose'}>
							{telemetryEngine.telemetry.jit.dynamicEvalAllowed ? 'ALLOWED' : 'BLOCKED'}
						</Badge>
					</MetricRow>
					{#if telemetryEngine.telemetry.jit.dynamicEvalAllowed}
						<MetricRow
							label="Eval Speed"
							value="{telemetryEngine.telemetry.jit.evalDurationMs.toFixed(3)} ms"
						/>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [10] HYPERVISOR ENTROPY HARVESTING -->
			<TelemetryTile
				title="[10] Entropy Harvest Speed"
				icon={Gauge}
				iconClass="text-purple-400"
				loading={!telemetryEngine.telemetry.entropy}
			>
				{#if telemetryEngine.telemetry.entropy}
					<MetricRow
						label="Entropy Yield"
						value="{telemetryEngine.telemetry.entropy.entropyGenerationRateMbSec.toFixed(2)} MB/s"
						valueClass="text-purple-400"
					/>
					<MetricRow
						label="Harvest Latency"
						value="{telemetryEngine.telemetry.entropy.durationMs.toFixed(2)} ms"
					/>
				{/if}
			</TelemetryTile>

			<!-- [11] WASM INTERPRETATION SANDBOX -->
			<TelemetryTile
				title="[11] WASM Sandbox Bounds"
				icon={CodeXml}
				iconClass="text-emerald-400"
				loading={!telemetryEngine.telemetry.wasm}
			>
				{#if telemetryEngine.telemetry.wasm}
					<MetricRow label="Compilation">
						<Badge variant={telemetryEngine.telemetry.wasm.allowed ? 'emerald' : 'rose'}>
							{telemetryEngine.telemetry.wasm.allowed ? 'UNRESTRICTED' : 'BLOCKED'}
						</Badge>
					</MetricRow>
					{#if telemetryEngine.telemetry.wasm.allowed}
						<MetricRow
							label="Compile Time"
							value="{telemetryEngine.telemetry.wasm.compileDurationMs.toFixed(3)} ms"
						/>
					{/if}
					{#if telemetryEngine.telemetry.memory}
						<MetricRow
							label="Max WASM Heap"
							value="{telemetryEngine.telemetry.memory.MaxSafeWasmAllocationMb} MB"
							valueClass="text-purple-400"
						/>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [12] SERIALIZATION & HEAP STRESS -->
			<TelemetryTile
				title="[12] Serialization Stress"
				icon={Boxes}
				iconClass="text-yellow-400"
				loading={!telemetryEngine.telemetry.serializationStress}
			>
				{#if telemetryEngine.telemetry.serializationStress}
					<MetricRow
						label="JSON Throughput"
						value="{telemetryEngine.telemetry.serializationStress.jsonThroughputMbSec} MB/s"
						valueClass="text-yellow-400"
					/>
					<MetricRow
						label="Structured Clone"
						value="{telemetryEngine.telemetry.serializationStress.structuredCloneLatencyMs} ms"
						valueClass="text-white"
					/>
					<MetricRow
						label="Payload Scale"
						value="{Math.round(
							telemetryEngine.telemetry.serializationStress.payloadSizeBytes / 1024
						)} KB"
						valueClass="text-zinc-400"
					/>
				{/if}
			</TelemetryTile>

			<!-- [13] EPHEMERAL DISK SUBSYSTEM -->
			<TelemetryTile
				title="[13] Ephemeral Disk Medium"
				icon={HardDrive}
				iconClass="text-zinc-300"
				loading={!telemetryEngine.telemetry.disk}
			>
				{#if telemetryEngine.telemetry.disk}
					<MetricRow label="File System">
						<Badge variant={telemetryEngine.telemetry.disk.hasDiskAccess ? 'emerald' : 'rose'}>
							{telemetryEngine.telemetry.disk.hasDiskAccess ? 'ACCESSIBLE' : 'SANDBOXED'}
						</Badge>
					</MetricRow>
					{#if telemetryEngine.telemetry.disk.hasDiskAccess}
						<MetricRow
							label="Storage Type"
							value={telemetryEngine.telemetry.disk.diskType}
							valueClass="text-cyan-400 truncate max-w-32"
						/>
						<MetricRow
							label="256KB Write"
							value="{telemetryEngine.telemetry.disk.writeLatencyMs.toFixed(2)} ms"
						/>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [14] BOUNDARY EXPLORATION & EGRESS -->
			<TelemetryTile
				title="[14] Outbound Egress Pipeline"
				icon={Network}
				iconClass="text-purple-400"
				loading={!telemetryEngine.telemetry.egress}
			>
				{#if telemetryEngine.telemetry.egress}
					<MetricRow label="Internet Egress">
						<Badge variant={telemetryEngine.telemetry.egress.outboundAccess ? 'emerald' : 'rose'}>
							{telemetryEngine.telemetry.egress.outboundAccess ? 'OPEN' : 'FIREWALLED'}
						</Badge>
					</MetricRow>
					{#if telemetryEngine.telemetry.egress.pingMs !== -1}
						<MetricRow
							label="Gateway Ping"
							value="{telemetryEngine.telemetry.egress.pingMs.toFixed(1)} ms"
						/>
					{/if}
				{/if}
			</TelemetryTile>

			<!-- [15] MULTI-RESOLVER EGRESS MESH -->
			<TelemetryTile
				title="[15] Multi-Resolver DNS Mesh"
				icon={Globe}
				iconClass="text-blue-400"
				loading={!telemetryEngine.telemetry.multiEgressMatrix}
			>
				{#if telemetryEngine.telemetry.multiEgressMatrix}
					<MetricRow
						label="Cloudflare (1.1.1.1)"
						value="{telemetryEngine.telemetry.multiEgressMatrix.cloudflareDnsMs} ms"
						valueClass="text-orange-400"
					/>
					<MetricRow
						label="Google (8.8.8.8)"
						value="{telemetryEngine.telemetry.multiEgressMatrix.googleDnsMs} ms"
						valueClass="text-blue-400"
					/>
					<MetricRow
						label="Quad9 (9.9.9.9)"
						value="{telemetryEngine.telemetry.multiEgressMatrix.quad9DnsMs} ms"
						valueClass="text-purple-400"
					/>
				{/if}
			</TelemetryTile>

			<!-- [16] NETWORK SURVEILLANCE MATRIX -->
			<TelemetryTile
				title="[16] Network Surveillance"
				icon={Eye}
				iconClass="text-orange-400"
				variant="surveillance"
				loading={!telemetryEngine.telemetry.surveillance}
			>
				{#if telemetryEngine.telemetry.surveillance}
					<MetricRow
						label="Client IP Header"
						value={telemetryEngine.telemetry.surveillance.clientIpHeaderLeaked}
						valueClass="text-blue-400 truncate max-w-32"
					/>
					<MetricRow
						label="Routing Path"
						value={telemetryEngine.telemetry.surveillance.proxyChainDetected
							? 'MULTI-HOP'
							: 'DIRECT'}
					/>
					<MetricRow
						label="Privacy Index"
						value="{telemetryEngine.telemetry.surveillance.anonymityScore}/100"
						valueClass="text-cyan-400"
					/>
				{/if}
			</TelemetryTile>

			<!-- [17] MICROTASK CONCURRENCY MESH -->
			<TelemetryTile
				title="[17] Concurrency & Event Loop"
				icon={Cpu}
				iconClass="text-blue-400"
				loading={!telemetryEngine.telemetry.concurrency}
			>
				{#if telemetryEngine.telemetry.concurrency}
					<MetricRow
						label="Event Loop Lag"
						value="{telemetryEngine.telemetry.concurrency.eventLoopLagMs.toFixed(3)} ms"
						valueClass="text-emerald-400"
					/>
					<MetricRow
						label="Sync 20ms Burn"
						value="{telemetryEngine.telemetry.concurrency.syncBurnOps.toLocaleString()} ops"
						valueClass="text-purple-400"
					/>
				{/if}
			</TelemetryTile>

			<!-- [18] CLIENT PRIVACY & DEVICE MATRIX -->
			<TelemetryTile
				title="[18] Client Privacy Matrix"
				icon={Laptop}
				iconClass="text-blue-400"
				variant="client"
				loading={!telemetryEngine.telemetry.client}
			>
				{#if telemetryEngine.telemetry.client}
					<MetricRow
						label="Cores / Threads"
						value="{telemetryEngine.telemetry.client.cores} Cores"
					/>
					<MetricRow
						label="Audio Farbling"
						value={telemetryEngine.telemetry.client.audio.isAudioFarbled
							? 'FARBLE ACTIVE'
							: 'UNALTERED'}
						valueClass={telemetryEngine.telemetry.client.audio.isAudioFarbled
							? 'text-amber-400'
							: 'text-zinc-400'}
					/>
					<MetricRow
						label="System Fonts"
						value="{telemetryEngine.telemetry.client.fonts.detectedFontCount} detected"
						valueClass="text-cyan-400"
					/>
					<MetricRow
						label="GPU Renderer"
						value={telemetryEngine.telemetry.client.gpu.renderer}
						valueClass="text-cyan-400 truncate max-w-32"
					/>
				{/if}
			</TelemetryTile>

			<!-- [19] TELEMETRY CORE CONTROLLER -->
			<TelemetryTile
				title="[19] Telemetry Controller"
				icon={Play}
				iconClass="text-cyan-400"
				variant="command"
			>
				<div class="space-y-2">
					<MetricRow label="Engine Status">
						<Badge variant={telemetryEngine.streamActive ? 'emerald' : 'zinc'}>
							{telemetryEngine.streamActive ? 'INTERROGATING' : 'IDLE'}
						</Badge>
					</MetricRow>
					<MetricRow
						label="Gateway Latency"
						value={telemetryEngine.networkLatency !== null
							? `${telemetryEngine.networkLatency} ms`
							: 'UNPROBED'}
					/>
				</div>

				<button
					onclick={() => telemetryEngine.launch()}
					disabled={telemetryEngine.streamActive}
					class="mt-4 flex w-full items-center justify-between rounded border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 font-mono text-xs font-semibold text-cyan-400 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
				>
					<span
						>{telemetryEngine.streamActive
							? 'PROBING RUNTIME STACK...'
							: 'LAUNCH ADVERSARIAL INSPECTION'}</span
					>
					<Play size={14} class="fill-current" />
				</button>
			</TelemetryTile>
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
