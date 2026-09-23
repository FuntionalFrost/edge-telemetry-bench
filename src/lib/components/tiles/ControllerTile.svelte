<script lang="ts">
	import { telemetryEngine } from '$lib/client/telemetry.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import CyberMeter from '$lib/components/CyberMeter.svelte';
	import MetricRow from '$lib/components/MetricRow.svelte';
	import TelemetryTile from '$lib/components/TelemetryTile.svelte';
	import { Play, Sparkles, Waypoints } from '@lucide/svelte';

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
</TelemetryTile>
