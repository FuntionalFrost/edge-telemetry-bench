<script lang="ts">
	import { telemetryEngine } from '$lib/client/telemetry.svelte';
	import { Check, Copy, Download, RotateCcw } from '@lucide/svelte';
</script>

<header
	class="mb-6 flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between"
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
		<p class="mt-1 font-mono text-xs tracking-wide text-zinc-400">
			Adversarial benchmarking, microarchitectural side-channels, and multi-vector telemetry matrix.
		</p>
	</div>

	<!-- Tactical Telemetry HUD & Actions Toolbar -->
	<div class="flex flex-wrap items-center gap-3">
		<!-- Stream & Ingress HUD Pill -->
		<div
			class="flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#06080e]/90 px-3 py-1.5 shadow-lg backdrop-blur-md"
		>
			<span class="relative flex size-2.5">
				{#if telemetryEngine.streamActive}
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
					></span>
					<span
						class="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"
					></span>
				{:else}
					<span class="relative inline-flex size-2.5 rounded-full bg-zinc-500"></span>
				{/if}
			</span>
			<span
				class="font-mono text-[11px] font-bold tracking-wider {telemetryEngine.streamActive
					? 'text-emerald-300'
					: 'text-zinc-400'}"
			>
				{telemetryEngine.streamActive ? 'STREAM ACTIVE' : 'STREAM IDLE'}
			</span>

			{#if telemetryEngine.networkLatency !== null}
				<span class="text-zinc-700">|</span>
				<span class="font-mono text-[11px] font-medium text-cyan-300">
					RTT: <strong class="font-bold text-cyan-200">{telemetryEngine.networkLatency}ms</strong>
				</span>
			{/if}

			<span class="text-zinc-700">|</span>
			<span class="font-mono text-[11px] text-zinc-300">
				VECTORS: <strong class="font-bold text-white"
					>{telemetryEngine.activeVectorCount}/{telemetryEngine.totalVectors}</strong
				>
			</span>
		</div>

		<!-- Operational Toolbar -->
		<div class="flex items-center gap-2">
			<!-- Auto-Poll Toggle -->
			<button
				onclick={() => telemetryEngine.toggleAutoPoll()}
				class="flex cursor-pointer items-center gap-1.5 rounded-md border font-mono text-[11px] font-semibold transition-all {telemetryEngine.autoPoll
					? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
					: 'border-white/10 bg-zinc-900/80 text-zinc-400 hover:border-white/20 hover:text-zinc-200'}"
				title="Toggle 3.5s continuous background telemetry interrogation"
			>
				<RotateCcw
					size={12}
					class={telemetryEngine.streamActive && telemetryEngine.autoPoll ? 'animate-spin' : ''}
				/>
				{telemetryEngine.autoPoll ? 'AUTO-POLL: ON' : 'AUTO-POLL: OFF'}
			</button>

			<!-- Export JSON Trace -->
			<button
				onclick={() => telemetryEngine.exportTrace()}
				class="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-zinc-900/80 font-mono text-[11px] font-medium text-zinc-300 transition-all hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-200 hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
				title="Download full forensic JSON telemetry snapshot"
			>
				<Download size={12} class="text-cyan-400" />
				EXPORT TRACE
			</button>

			<!-- Copy Report -->
			<button
				onclick={() => void telemetryEngine.copySummary()}
				class="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-zinc-900/80 font-mono text-[11px] font-medium text-zinc-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-emerald-200 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]"
				title="Copy markdown diagnostic summary to clipboard"
			>
				{#if telemetryEngine.copied}
					<Check size={12} class="text-emerald-400" />
					<span class="font-semibold text-emerald-300">COPIED!</span>
				{:else}
					<Copy size={12} class="text-zinc-400" />
					COPY REPORT
				{/if}
			</button>
		</div>
	</div>
</header>
