<script lang="ts">
	import { telemetryEngine } from '$lib/client/telemetry.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { Globe, MonitorPlay, Satellite, ShieldAlert } from '@lucide/svelte';
</script>

<section class="mb-6 grid grid-cols-1 gap-3 font-mono sm:grid-cols-2 lg:grid-cols-4">
	<!-- Pillar 1: Runtime & Host -->
	<div
		class="flex flex-col justify-between rounded-lg border border-emerald-500/25 border-l-2 border-l-emerald-400 bg-[#06080e]/90 p-3 shadow-lg backdrop-blur-md"
	>
		<div class="flex items-center justify-between text-[11px] text-zinc-400">
			<span
				class="flex items-center gap-1.5 font-semibold tracking-wider text-emerald-400 uppercase"
			>
				<Satellite size={13} /> Runtime Host
			</span>
			<span class="text-[11px] font-bold text-emerald-300"
				>{telemetryEngine.telemetry.cloudMetadata?.region ?? 'Local'}</span
			>
		</div>
		<div
			class="mt-2 truncate text-xs font-semibold text-white"
			title={telemetryEngine.telemetry.cloudMetadata?.platform ?? 'Probing...'}
		>
			{telemetryEngine.telemetry.cloudMetadata?.platform ?? 'Probing runtime host...'}
		</div>
		<div
			class="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-zinc-400"
		>
			<span
				>Arch: <strong class="text-zinc-200"
					>{telemetryEngine.telemetry.cloudMetadata?.architecture ?? 'x64'}</strong
				></span
			>
			<span
				>Heap: <strong class="font-medium text-teal-300"
					>{telemetryEngine.telemetry.isolateLifecycle
						? `${telemetryEngine.telemetry.isolateLifecycle.heapUsedMb} MB`
						: '--'}</strong
				></span
			>
		</div>
	</div>

	<!-- Pillar 2: Security & Side-Channels -->
	<div
		class="flex flex-col justify-between rounded-lg border border-rose-500/25 border-l-2 border-l-rose-400 bg-[#06080e]/90 p-3 shadow-lg backdrop-blur-md"
	>
		<div class="flex items-center justify-between text-[11px] text-zinc-400">
			<span class="flex items-center gap-1.5 font-semibold tracking-wider text-rose-400 uppercase">
				<ShieldAlert size={13} /> Spectre Risk
			</span>
			<Badge
				variant={telemetryEngine.telemetry.spectrePrimitives?.vulnerabilityProfile === 'Hardened'
					? 'emerald'
					: telemetryEngine.telemetry.spectrePrimitives?.vulnerabilityProfile === 'Elevated Risk'
						? 'rose'
						: 'amber'}
				class="px-1.5 py-0 text-[9px] font-bold"
			>
				{telemetryEngine.telemetry.spectrePrimitives?.vulnerabilityProfile ?? 'ANALYZING'}
			</Badge>
		</div>
		<div class="mt-2 text-xs font-semibold text-white">
			SharedArrayBuffer: <span
				class={telemetryEngine.telemetry.spectrePrimitives?.hasSharedArrayBuffer
					? 'font-bold text-rose-300'
					: 'font-bold text-emerald-300'}
				>{telemetryEngine.telemetry.spectrePrimitives
					? telemetryEngine.telemetry.spectrePrimitives.hasSharedArrayBuffer
						? 'Exposed'
						: 'Protected'
					: '--'}</span
			>
		</div>
		<div
			class="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-zinc-400"
		>
			<span
				>Clock: <strong class="text-zinc-200"
					>{telemetryEngine.telemetry.clock
						? `${telemetryEngine.telemetry.clock.minIncrementMs.toFixed(4)}ms`
						: '--'}</strong
				></span
			>
			<span
				>Bleed: <strong
					class={telemetryEngine.telemetry.contextLeak?.contextIsPolluted
						? 'font-bold text-rose-300'
						: 'font-bold text-emerald-300'}
					>{telemetryEngine.telemetry.contextLeak
						? telemetryEngine.telemetry.contextLeak.contextIsPolluted
							? 'DIRTY'
							: 'PURE'
						: '--'}</strong
				></span
			>
		</div>
	</div>

	<!-- Pillar 3: Network & Anonymity -->
	<div
		class="flex flex-col justify-between rounded-lg border border-cyan-500/25 border-l-2 border-l-cyan-400 bg-[#06080e]/90 p-3 shadow-lg backdrop-blur-md"
	>
		<div class="flex items-center justify-between text-[11px] text-zinc-400">
			<span class="flex items-center gap-1.5 font-semibold tracking-wider text-cyan-400 uppercase">
				<Globe size={13} /> Network Mesh
			</span>
			<span class="text-[11px] font-bold text-cyan-300"
				>{telemetryEngine.telemetry.surveillance
					? `${telemetryEngine.telemetry.surveillance.anonymityScore}/100`
					: '--'}</span
			>
		</div>
		<div class="mt-2 truncate text-xs font-semibold text-white">
			IP: <span class="text-sky-300"
				>{telemetryEngine.telemetry.surveillance?.clientIpHeaderLeaked ?? 'Probing...'}</span
			>
		</div>
		<div
			class="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-zinc-400"
		>
			<span
				>Egress: <strong
					class={telemetryEngine.telemetry.egress?.outboundAccess
						? 'text-emerald-300'
						: 'text-rose-300'}
					>{telemetryEngine.telemetry.egress
						? telemetryEngine.telemetry.egress.outboundAccess
							? 'OPEN'
							: 'BLOCKED'
						: '--'}</strong
				></span
			>
			<span
				>DNS: <strong class="text-orange-300"
					>{telemetryEngine.telemetry.multiEgressMatrix?.cloudflareDnsMs
						? `${telemetryEngine.telemetry.multiEgressMatrix.cloudflareDnsMs}ms`
						: '--'}</strong
				></span
			>
		</div>
	</div>

	<!-- Pillar 4: Client Display & Concurrency -->
	<div
		class="flex flex-col justify-between rounded-lg border border-purple-500/25 border-l-2 border-l-purple-400 bg-[#06080e]/90 p-3 shadow-lg backdrop-blur-md"
	>
		<div class="flex items-center justify-between text-[11px] text-zinc-400">
			<span
				class="flex items-center gap-1.5 font-semibold tracking-wider text-purple-400 uppercase"
			>
				<MonitorPlay size={13} /> Client Forensics
			</span>
			<span class="text-[11px] font-bold text-purple-300"
				>{telemetryEngine.telemetry.client?.cores ?? '--'} Cores</span
			>
		</div>
		<div class="mt-2 text-xs font-semibold text-white">
			Render: <strong class="font-bold text-emerald-300"
				>{telemetryEngine.telemetry.client?.frameTiming
					? `${telemetryEngine.telemetry.client.frameTiming.realtimeFps} FPS`
					: '--'}</strong
			>
			<span class="font-normal text-[10px] text-zinc-400"
				>({telemetryEngine.telemetry.client?.frameTiming?.estimatedRefreshRateHz ?? 60}Hz)</span
			>
		</div>
		<div
			class="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-zinc-400"
		>
			<span
				>Long Tasks: <strong
					class={telemetryEngine.telemetry.client?.longTasks?.longTaskCount === 0
						? 'text-emerald-300'
						: 'text-rose-300'}
					>{telemetryEngine.telemetry.client?.longTasks
						? `${telemetryEngine.telemetry.client.longTasks.longTaskCount} blk`
						: '--'}</strong
				></span
			>
			<span
				>Reflow: <strong class="text-orange-300"
					>{telemetryEngine.telemetry.client?.layoutThrashing?.opsPerSec
						? `${telemetryEngine.telemetry.client.layoutThrashing.opsPerSec} ops/s`
						: '--'}</strong
				></span
			>
		</div>
	</div>
</section>
