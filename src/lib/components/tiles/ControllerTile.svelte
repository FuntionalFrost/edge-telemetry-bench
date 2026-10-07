<script lang="ts">
	import { telemetryEngine } from '#lib/client/telemetry.svelte.js';
	import Badge from '#lib/components/Badge.svelte';
	import CyberMeter from '#lib/components/CyberMeter.svelte';
	import MetricRow from '#lib/components/MetricRow.svelte';
	import TelemetryTile from '#lib/components/TelemetryTile.svelte';
	import { Play, Sparkles, Waypoints } from '@lucide/svelte';
	import { theme, toast, type AccentName } from 'yaxa-svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<TelemetryTile
	title="[27] Telemetry Controller"
	icon={Waypoints}
	variant="command"
	class="sm:col-span-2 lg:col-span-2 xl:col-span-2 {className}"
>
	<div class="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
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

		<div class="flex h-full flex-col justify-end">
			<button
				onclick={() => telemetryEngine.launch()}
				disabled={telemetryEngine.streamActive}
				class="flex w-full cursor-pointer items-center justify-between rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-3 font-mono text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all hover:border-cyan-400 hover:bg-cyan-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
			>
				<span class="flex items-center gap-2">
					<Sparkles size={14} class="text-cyan-400" />
					{telemetryEngine.streamActive
						? 'PROBING RUNTIME STACK...'
						: 'LAUNCH ADVERSARIAL INSPECTION'}
				</span>
				<Play size={14} class="fill-current text-cyan-300" />
			</button>
		</div>
	</div>

	<!-- Tactical Theme Accent Switcher -->
	<div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
		<span class="font-mono text-[10px] uppercase tracking-wider text-zinc-400"
			>Terminal Theme Accent</span
		>
		<div class="flex items-center gap-1.5">
			{#each [{ id: 'sky', label: 'CYAN', color: 'bg-cyan-400' }, { id: 'emerald', label: 'MATRIX', color: 'bg-emerald-400' }, { id: 'amber', label: 'AMBER', color: 'bg-amber-400' }, { id: 'violet', label: 'SYNTH', color: 'bg-violet-400' }] as p (p.id)}
				<button
					type="button"
					onclick={() => {
						theme.setAccent(p.id as AccentName);
						toast.info(`Theme Accent: ${p.label}`, {
							description: `Switched palette to ${p.id}`
						});
					}}
					class="flex cursor-pointer items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold transition-all {theme.accent ===
					p.id
						? 'border-white/50 bg-white/15 text-white shadow-[0_0_10px_rgba(255,255,255,0.25)]'
						: 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20 hover:text-zinc-200'}"
				>
					<span class="size-1.5 rounded-full {p.color}"></span>
					{p.label}
				</button>
			{/each}
		</div>
	</div>
</TelemetryTile>
