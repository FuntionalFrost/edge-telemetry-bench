<script lang="ts">
	import type { TelemetryState } from '$lib/client/telemetry.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import CyberMeter from '$lib/components/CyberMeter.svelte';
	import MetricRow from '$lib/components/MetricRow.svelte';
	import TelemetryTile from '$lib/components/TelemetryTile.svelte';
	import type { AnyVectorDef } from '$lib/config/telemetry-registry';

	interface Props {
		def: AnyVectorDef;
		state: TelemetryState;
	}

	let { def, state }: Props = $props();

	let data = $derived(def.selector(state));
	let isLoading = $derived(data === null || data === undefined);
</script>

<TelemetryTile title={def.title} icon={def.icon} variant={def.variant} loading={isLoading}>
	{#if data}
		{#each def.fields as field (field.label)}
			{#if !field.shouldRender || field.shouldRender(data)}
				{#if field.getBadge}
					{@const badge = field.getBadge(data)}
					<MetricRow label={field.label} tooltip={field.tooltip}>
						<Badge variant={badge.variant}>
							{badge.text}
						</Badge>
					</MetricRow>
				{:else if field.getToken}
					<MetricRow label={field.label} tooltip={field.tooltip}>
						<span
							class="rounded border border-cyan-500/30 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-cyan-300"
						>
							{field.getToken(data)}
						</span>
					</MetricRow>
				{:else if field.getValue}
					<MetricRow
						label={field.label}
						value={field.getValue(data)}
						valueClass={typeof field.valueClass === 'function'
							? field.valueClass(data)
							: field.valueClass}
						tooltip={field.tooltip}
					/>
				{/if}
			{/if}
		{/each}

		{#if def.meter}
			<CyberMeter
				value={def.meter.getValue(data)}
				max={def.meter.max ?? 100}
				variant={typeof def.meter.variant === 'function'
					? def.meter.variant(data)
					: def.meter.variant}
				label={def.meter.label}
				showValue={def.meter.showValue}
				unit={def.meter.unit}
			/>
		{/if}
	{/if}
</TelemetryTile>
