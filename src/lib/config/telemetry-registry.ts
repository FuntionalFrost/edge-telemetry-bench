// src/lib/config/telemetry-registry.ts
import type { TelemetryState } from '$lib/client/telemetry.svelte';
import type { BadgeVariants } from '$lib/components/Badge.svelte';
import type { TelemetryTileVariants } from '$lib/components/TelemetryTile.svelte';
import {
	Activity,
	Atom,
	Boxes,
	BrainCircuit,
	CircleGauge,
	CircuitBoard,
	Cpu,
	Database,
	FileCode2,
	Flame,
	GitFork,
	Globe,
	Grid3x3,
	KeyRound,
	Layers,
	MonitorPlay,
	Network,
	Radar,
	Radio,
	RadioTower,
	Satellite,
	ScanEye,
	ScanSearch,
	ShieldAlert,
	TriangleAlert,
	Waves
} from '@lucide/svelte';
import type { Component } from 'svelte';

export type DomainFilter =
	'all' | 'server' | 'security' | 'crypto' | 'network' | 'client' | 'command';

export interface DomainFilterItem {
	id: DomainFilter;
	label: string;
	count: number;
}

export const DOMAIN_FILTERS: DomainFilterItem[] = [
	{ id: 'all', label: 'ALL DOMAINS', count: 27 },
	{ id: 'server', label: 'SERVER ISOLATES', count: 7 },
	{ id: 'security', label: 'SECURITY & SPECTRE', count: 5 },
	{ id: 'crypto', label: 'WEBCRYPTO & ENTROPY', count: 2 },
	{ id: 'network', label: 'EGRESS & DNS', count: 3 },
	{ id: 'client', label: 'CLIENT FORENSICS', count: 9 },
	{ id: 'command', label: 'CONTROLLER', count: 1 }
];

// Formatting Utilities
export function formatUptime(ms: number): string {
	if (ms >= 1000) {
		return `${(ms / 1000).toFixed(2)} s`;
	}
	return `${ms.toFixed(1)} ms`;
}

export function formatBytesKb(kb: number): string {
	if (kb >= 1024) {
		return `${(kb / 1024).toFixed(2)} MB`;
	}
	return `${kb.toFixed(1)} KB`;
}

export function formatSubMs(ms: number): string {
	if (ms <= 0) return '0.00 ms';
	if (ms < 0.01) {
		const us = ms * 1000;
		return `${us.toFixed(1)} µs (<0.01 ms)`;
	}
	return `${ms.toFixed(2)} ms`;
}

export function formatClockPrecision(ms: number): string {
	if (ms < 0.001) {
		const ns = Math.round(ms * 1_000_000);
		return `${ms.toFixed(5)} ms (${ns} ns)`;
	}
	return `${ms.toFixed(4)} ms`;
}

export function formatGpuRenderer(str: string): string {
	if (!str) return 'Unknown';
	const match = str.match(/ANGLE \(([^,]+),\s*([^,]+?)(?:\s+Direct3D|\s+OpenGL|\s+Vulkan|\))/i);
	if (match) {
		return `${match[1].trim()} ${match[2].trim()}`;
	}
	return str.length > 28 ? str.slice(0, 26) + '…' : str;
}

export function getJitterStabilityClass(rating: string): string {
	const lower = rating.toLowerCase();
	if (lower.includes('high') || lower.includes('crit')) return 'text-rose-400 font-semibold';
	if (lower.includes('mod')) return 'text-amber-300 font-semibold';
	return 'text-emerald-300 font-semibold';
}

export type CyberMeterVariant =
	'emerald' | 'rose' | 'amber' | 'cyan' | 'teal' | 'indigo' | 'orange' | 'purple' | 'default';

export interface BadgeConfig {
	text: string;
	variant: BadgeVariants['variant'];
}

export interface MetricFieldDef<T> {
	label: string;
	tooltip?: string;
	valueClass?: string | ((data: NonNullable<T>) => string);
	getValue?: (data: NonNullable<T>) => string | number;
	getBadge?: (data: NonNullable<T>) => BadgeConfig;
	getToken?: (data: NonNullable<T>) => string;
	shouldRender?: (data: NonNullable<T>) => boolean;
}

export interface MeterDef<T> {
	getValue: (data: NonNullable<T>) => number;
	max?: number;
	label?: string;
	variant: CyberMeterVariant | ((data: NonNullable<T>) => CyberMeterVariant);
	showValue?: boolean;
	unit?: string;
}

export interface VectorDef<T = unknown> {
	id: number;
	title: string;
	domain: DomainFilter;
	icon: Component<{ size?: number; class?: string }>;
	variant: TelemetryTileVariants['variant'];
	selector: (state: TelemetryState) => T | null | undefined;
	fields: MetricFieldDef<T>[];
	meter?: MeterDef<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyVectorDef = VectorDef<any>;

export function defineVector<T>(def: VectorDef<T>): AnyVectorDef {
	return def as AnyVectorDef;
}

// 26 Standard Telemetry Vector Definitions
export const STANDARD_VECTORS: AnyVectorDef[] = [
	// [01] SERVER ISOLATE BASE
	defineVector({
		id: 1,
		title: '[01] Server Isolate Base',
		domain: 'server',
		icon: BrainCircuit,
		variant: 'server',
		selector: (s) => s.identity,
		fields: [
			{
				label: 'Uptime',
				getValue: (d) => formatUptime(d.uptimeMs),
				tooltip: 'Serverless isolate continuous uptime since cold instantiation.'
			},
			{
				label: 'Activations',
				getValue: (d) => d.activations,
				valueClass: 'text-emerald-300 font-bold',
				tooltip: 'Number of requests handled by this specific isolate instance.'
			},
			{
				label: 'Global Scope',
				getValue: (d) => `${d.globalKeysCount} keys`,
				tooltip: 'Total primitive objects and runtime globals detected in globalThis.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, Math.round(d.uptimeMs / 5)),
			max: 100,
			variant: 'emerald',
			label: 'Isolate Longevity'
		}
	}),

	// [02] CLOUD PLATFORM & REGION
	defineVector({
		id: 2,
		title: '[02] Cloud Platform & Region',
		domain: 'server',
		icon: Satellite,
		variant: 'server',
		selector: (s) => s.cloudMetadata,
		fields: [
			{
				label: 'Platform',
				getValue: (d) => d.platform,
				valueClass: 'text-sky-300 font-semibold text-[11px] text-right',
				tooltip: 'Detected serverless execution environment and runtime host.'
			},
			{
				label: 'Region',
				getValue: (d) => d.region,
				valueClass: 'text-emerald-300 font-semibold',
				tooltip: 'Cloud edge gateway deployment point of presence (PoP).'
			},
			{
				label: 'Arch / Engine',
				getValue: (d) => d.architecture,
				valueClass: 'text-zinc-200 text-[11px] text-right',
				tooltip: 'Underlying container architecture (x64/arm64) and V8/Node engine.'
			}
		],
		meter: {
			getValue: () => 100,
			max: 100,
			variant: 'emerald',
			label: 'Hypervisor Integrity'
		}
	}),

	// [03] LIFECYCLE & HEAP DELTA
	defineVector({
		id: 3,
		title: '[03] Lifecycle & Heap Delta',
		domain: 'server',
		icon: Boxes,
		variant: 'server',
		selector: (s) => s.isolateLifecycle,
		fields: [
			{
				label: 'Execution State',
				tooltip:
					'Cold boot indicates a freshly initialized isolate; warm indicates cached runtime reuse.',
				getBadge: (d) => ({
					text: d.isColdStart ? 'COLD BOOT' : 'WARM ISOLATE',
					variant: d.isColdStart ? 'purple' : 'emerald'
				})
			},
			{
				label: 'Heap Allocated',
				getValue: (d) => `${d.heapUsedMb} / ${d.heapTotalMb} MB`,
				valueClass: 'text-teal-300 font-semibold',
				tooltip: 'Current V8 heap memory consumption versus total allocated heap ceiling.'
			},
			{
				label: 'Instance Tag',
				getValue: (d) => `#${d.instanceId.slice(0, 10)}`,
				valueClass: 'text-zinc-300 font-mono text-[11px]',
				tooltip: 'Ephemeral cryptographic instance identifier for tracking isolate reuse.'
			}
		],
		meter: {
			getValue: (d) => d.heapUsedMb,
			max: 600,
			variant: 'emerald',
			showValue: true,
			unit: ' MB',
			label: 'V8 Heap Usage'
		}
	}),

	// [04] SPECTRE SIDE-CHANNELS
	defineVector({
		id: 4,
		title: '[04] Spectre Side-Channels',
		domain: 'security',
		icon: ShieldAlert,
		variant: 'security',
		selector: (s) => s.spectrePrimitives,
		fields: [
			{
				label: 'Attack Surface',
				tooltip:
					'Composite vulnerability score based on high-precision timer and memory sharing primitives.',
				getBadge: (d) => ({
					text: d.vulnerabilityProfile,
					variant:
						d.vulnerabilityProfile === 'Hardened'
							? 'emerald'
							: d.vulnerabilityProfile === 'Elevated Risk'
								? 'rose'
								: 'amber'
				})
			},
			{
				label: 'SharedArrayBuffer',
				getValue: (d) => (d.hasSharedArrayBuffer ? 'Exposed' : 'Protected'),
				valueClass: (d) =>
					d.hasSharedArrayBuffer ? 'text-rose-300 font-semibold' : 'text-emerald-300 font-semibold',
				tooltip:
					'High-precision shared memory buffer required for microarchitectural Spectre side-channels.'
			},
			{
				label: 'WASM SIMD128',
				getValue: (d) => (d.hasWasmSimd ? 'Active' : 'Disabled'),
				valueClass: (d) => (d.hasWasmSimd ? 'text-cyan-300 font-semibold' : 'text-zinc-500'),
				tooltip: '128-bit SIMD vector instructions providing high-throughput parallel execution.'
			}
		],
		meter: {
			getValue: (d) =>
				d.vulnerabilityProfile === 'Hardened'
					? 15
					: d.vulnerabilityProfile === 'Elevated Risk'
						? 85
						: 50,
			max: 100,
			variant: (d) => (d.vulnerabilityProfile === 'Hardened' ? 'emerald' : 'rose'),
			label: 'Speculation Vulnerability'
		}
	}),

	// [05] CLOCK RESOLUTION & JITTER
	defineVector({
		id: 5,
		title: '[05] Clock Resolution & Jitter',
		domain: 'security',
		icon: Radar,
		variant: 'security',
		selector: (s) => s.clock,
		fields: [
			{
				label: 'Timer Precision',
				getValue: (d) => formatClockPrecision(d.minIncrementMs),
				valueClass: 'text-zinc-100 font-bold',
				tooltip:
					'Minimum measurable tick on performance.now; coarsened by hypervisors to prevent timing attacks.'
			},
			{
				label: 'Mitigation Level',
				getValue: (d) => d.estimatedMitigationLevel,
				valueClass: (d) =>
					d.isCoarsened ? 'text-rose-300 font-semibold' : 'text-emerald-300 font-semibold',
				tooltip: 'Estimated level of Spectre clock coarsening and jitter injection.'
			}
		],
		meter: {
			getValue: (d) => (d.isCoarsened ? 90 : 15),
			max: 100,
			variant: (d) => (d.isCoarsened ? 'rose' : 'emerald'),
			label: 'Hypervisor Clamping'
		}
	}),

	// [06] MICROARCHITECTURAL CACHE
	defineVector({
		id: 6,
		title: '[06] Microarchitectural Cache',
		domain: 'server',
		icon: Waves,
		variant: 'server',
		selector: (s) => s.cacheJitter,
		fields: [
			{
				label: 'L1/L2 Mean Stride',
				getValue: (d) => `${d.l1L2AccessTimeNs} ns`,
				valueClass: 'text-indigo-300 font-semibold',
				tooltip: 'Pointer-chasing strided memory latency measuring L1/L2 cache read speed.'
			},
			{
				label: 'Jitter Variance',
				getValue: (d) => `${(d.varianceRatio * 100).toFixed(1)}%`,
				valueClass: (d) =>
					d.varianceRatio > 0.3 ? 'text-amber-300 font-semibold' : 'text-emerald-300 font-semibold',
				tooltip: 'Statistical latency variance ratio across multiple memory cache sweeps.'
			},
			{
				label: 'Neighbor Activity',
				getValue: (d) => d.noisyNeighborActivity,
				valueClass: 'text-zinc-200',
				tooltip: 'Interference heuristic evaluating noisy neighbor CPU core contention.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, Math.round(d.varianceRatio * 100)),
			max: 100,
			variant: (d) => (d.varianceRatio > 0.3 ? 'amber' : 'emerald'),
			showValue: true,
			unit: '%',
			label: 'Cache Timing Spread'
		}
	}),

	// [07] WEBCRYPTO ENCRYPTION
	defineVector({
		id: 7,
		title: '[07] WebCrypto Encryption',
		domain: 'crypto',
		icon: KeyRound,
		variant: 'crypto',
		selector: (s) => s.cryptoBench,
		fields: [
			{
				label: 'SHA-256 Digest',
				getValue: (d) => `${d.sha256ThroughputMbSec} MB/s`,
				valueClass: 'text-emerald-300 font-semibold',
				tooltip: 'Hardware-accelerated native WebCrypto SHA-256 hashing throughput.'
			},
			{
				label: 'AES-GCM 256',
				getValue: (d) => `${d.aesGcmThroughputMbSec} MB/s`,
				valueClass: 'text-teal-300 font-semibold',
				tooltip: 'AES-GCM 256-bit symmetric encryption throughput rate.'
			},
			{
				label: 'KeyGen Latency',
				getValue: (d) => `${d.keyGenLatencyMs} ms`,
				valueClass: 'text-zinc-200',
				tooltip: 'Time required to generate an authenticated 256-bit AES-GCM crypto key.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, d.sha256ThroughputMbSec),
			max: 100,
			variant: 'teal',
			label: 'Crypto Silicon Acceleration'
		}
	}),

	// [08] STATE POLLUTION BLEED
	defineVector({
		id: 8,
		title: '[08] State Pollution Bleed',
		domain: 'security',
		icon: GitFork,
		variant: 'bleed',
		selector: (s) => s.contextLeak,
		fields: [
			{
				label: 'Isolate Bleed',
				tooltip: 'Detects cross-request global state and memory bleed between isolate invocations.',
				getBadge: (d) => ({
					text: d.contextIsPolluted ? 'DIRTY HEAP' : 'PURE ISOLATE',
					variant: d.contextIsPolluted ? 'rose' : 'emerald'
				})
			},
			{
				label: 'Assigned Marker',
				getToken: (d) => d.currentAssignedMarker,
				tooltip: 'Unique per-request marker token injected into the runtime heap.'
			}
		],
		meter: {
			getValue: (d) => (d.contextIsPolluted ? 90 : 5),
			max: 100,
			variant: (d) => (d.contextIsPolluted ? 'rose' : 'emerald'),
			label: 'Heap Isolation Purity'
		}
	}),

	// [09] ENGINE JIT PRIVILEGES
	defineVector({
		id: 9,
		title: '[09] Engine JIT Privileges',
		domain: 'security',
		icon: Activity,
		variant: 'security',
		selector: (s) => s.jit,
		fields: [
			{
				label: 'Dynamic Eval',
				tooltip: 'Evaluates whether eval() and new Function() dynamic code execution is permitted.',
				getBadge: (d) => ({
					text: d.dynamicEvalAllowed ? 'ALLOWED' : 'BLOCKED',
					variant: d.dynamicEvalAllowed ? 'emerald' : 'rose'
				})
			},
			{
				label: 'Eval Speed',
				getValue: (d) => `${d.evalDurationMs.toFixed(3)} ms`,
				valueClass: 'text-zinc-200 font-semibold',
				shouldRender: (d) => d.dynamicEvalAllowed,
				tooltip: 'Execution latency of dynamically evaluated JIT code.'
			}
		],
		meter: {
			getValue: (d) => (d.dynamicEvalAllowed ? 85 : 10),
			max: 100,
			variant: (d) => (d.dynamicEvalAllowed ? 'emerald' : 'rose'),
			label: 'JIT Dynamic Code Exec'
		}
	}),

	// [10] ENTROPY HARVEST SPEED
	defineVector({
		id: 10,
		title: '[10] Entropy Harvest Speed',
		domain: 'crypto',
		icon: Atom,
		variant: 'crypto',
		selector: (s) => s.entropy,
		fields: [
			{
				label: 'Entropy Yield',
				getValue: (d) => `${d.entropyGenerationRateMbSec.toFixed(2)} MB/s`,
				valueClass: 'text-purple-300 font-semibold',
				tooltip: 'CSPRNG random byte generation throughput via crypto.getRandomValues.'
			},
			{
				label: 'Harvest Latency',
				getValue: (d) => formatSubMs(d.durationMs),
				valueClass: 'text-zinc-200 font-mono',
				tooltip: 'Duration required to harvest 64KB of cryptographically secure random entropy.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, Math.round(d.entropyGenerationRateMbSec * 2)),
			max: 100,
			variant: 'purple',
			showValue: true,
			unit: ' MB/s',
			label: 'CSPRNG Generation Speed'
		}
	}),

	// [11] WASM SANDBOX BOUNDS
	defineVector({
		id: 11,
		title: '[11] WASM Sandbox Bounds',
		domain: 'security',
		icon: CircuitBoard,
		variant: 'security',
		selector: (s) => s.wasm,
		fields: [
			{
				label: 'Compilation',
				tooltip: 'Permission state for dynamic WebAssembly module compilation.',
				getBadge: (d) => ({
					text: d.allowed ? 'UNRESTRICTED' : 'BLOCKED',
					variant: d.allowed ? 'emerald' : 'rose'
				})
			},
			{
				label: 'Compile Time',
				getValue: (d) => `${d.compileDurationMs.toFixed(3)} ms`,
				valueClass: 'text-indigo-300 font-semibold',
				shouldRender: (d) => d.allowed,
				tooltip: 'JIT compilation duration for standard WASM binary module.'
			}
		],
		meter: {
			getValue: (d) => (d.allowed ? 90 : 10),
			max: 100,
			variant: 'indigo',
			label: 'WASM Execution Engine'
		}
	}),

	// [12] SERIALIZATION STRESS
	defineVector({
		id: 12,
		title: '[12] Serialization Stress',
		domain: 'server',
		icon: FileCode2,
		variant: 'server',
		selector: (s) => s.serializationStress,
		fields: [
			{
				label: 'JSON Throughput',
				getValue: (d) => `${d.jsonThroughputMbSec} MB/s`,
				valueClass: 'text-amber-300 font-semibold',
				tooltip: 'V8 JSON.stringify and JSON.parse throughput under heap stress.'
			},
			{
				label: 'Structured Clone',
				getValue: (d) => `${d.structuredCloneLatencyMs} ms`,
				valueClass: 'text-zinc-100 font-semibold',
				tooltip: 'Execution latency for deep structuredClone object graph replication.'
			},
			{
				label: 'Payload Scale',
				getValue: (d) => `${Math.round(d.payloadSizeBytes / 1024)} KB`,
				valueClass: 'text-zinc-300',
				tooltip: 'Total byte scale of serialized diagnostic object payloads.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, Math.round(d.jsonThroughputMbSec / 2)),
			max: 100,
			variant: 'amber',
			label: 'V8 Serialization Pipeline'
		}
	}),

	// [13] EPHEMERAL DISK MEDIUM
	defineVector({
		id: 13,
		title: '[13] Ephemeral Disk Medium',
		domain: 'server',
		icon: Database,
		variant: 'server',
		selector: (s) => s.disk,
		fields: [
			{
				label: 'File System',
				tooltip: 'Checks whether local writable container disk storage (/tmp) is accessible.',
				getBadge: (d) => ({
					text: d.hasDiskAccess ? 'ACCESSIBLE' : 'SANDBOXED',
					variant: d.hasDiskAccess ? 'emerald' : 'rose'
				})
			},
			{
				label: 'Storage Type',
				getValue: (d) =>
					d.diskType === 'Persistent/Ephemeral Physical' ? 'Physical Disk' : d.diskType,
				valueClass: 'text-cyan-300 font-semibold text-right',
				shouldRender: (d) => d.hasDiskAccess,
				tooltip: 'Inferred filesystem medium.'
			},
			{
				label: '256KB Write',
				getValue: (d) => `${d.writeLatencyMs.toFixed(2)} ms`,
				valueClass: 'text-zinc-200',
				shouldRender: (d) => d.hasDiskAccess,
				tooltip: 'Synchronous disk write and flush latency for a 256KB payload.'
			}
		],
		meter: {
			getValue: (d) => (d.hasDiskAccess ? 85 : 15),
			max: 100,
			variant: 'emerald',
			label: 'Disk I/O Write Capacity'
		}
	}),

	// [14] OUTBOUND EGRESS PIPELINE
	defineVector({
		id: 14,
		title: '[14] Outbound Egress Pipeline',
		domain: 'network',
		icon: Globe,
		variant: 'network',
		selector: (s) => s.egress,
		fields: [
			{
				label: 'Internet Egress',
				tooltip: 'Outbound internet egress firewall status from inside the edge isolate.',
				getBadge: (d) => ({
					text: d.outboundAccess ? 'OPEN' : 'FIREWALLED',
					variant: d.outboundAccess ? 'emerald' : 'rose'
				})
			},
			{
				label: 'Gateway Ping',
				getValue: (d) => `${d.pingMs.toFixed(1)} ms`,
				valueClass: 'text-cyan-300 font-semibold',
				shouldRender: (d) => d.pingMs !== -1,
				tooltip: 'Round-trip latency to edge gateway egress endpoint.'
			}
		],
		meter: {
			getValue: (d) => (d.outboundAccess ? 100 : 0),
			max: 100,
			variant: (d) => (d.outboundAccess ? 'emerald' : 'rose'),
			label: 'Egress Pipe Integrity'
		}
	}),

	// [15] MULTI-RESOLVER DNS MESH
	defineVector({
		id: 15,
		title: '[15] Multi-Resolver DNS Mesh',
		domain: 'network',
		icon: RadioTower,
		variant: 'network',
		selector: (s) => s.multiEgressMatrix,
		fields: [
			{
				label: 'Cloudflare (1.1.1.1)',
				getValue: (d) => `${d.cloudflareDnsMs} ms`,
				valueClass: 'text-orange-300 font-semibold',
				tooltip: 'Concurrent HEAD resolution latency to Cloudflare 1.1.1.1 DNS.'
			},
			{
				label: 'Google (8.8.8.8)',
				getValue: (d) => `${d.googleDnsMs} ms`,
				valueClass: 'text-sky-300 font-semibold',
				tooltip: 'Concurrent HEAD resolution latency to Google 8.8.8.8 DNS.'
			},
			{
				label: 'Quad9 (9.9.9.9)',
				getValue: (d) => `${d.quad9DnsMs} ms`,
				valueClass: 'text-purple-300 font-semibold',
				tooltip: 'Concurrent HEAD resolution latency to Quad9 9.9.9.9 DNS.'
			}
		],
		meter: {
			getValue: (d) => Math.max(5, Math.min(100, 100 - (d.cloudflareDnsMs || 40))),
			max: 100,
			variant: 'cyan',
			label: 'DNS Mesh Latency Index'
		}
	}),

	// [16] NETWORK SURVEILLANCE
	defineVector({
		id: 16,
		title: '[16] Network Surveillance',
		domain: 'network',
		icon: ScanSearch,
		variant: 'surveillance',
		selector: (s) => s.surveillance,
		fields: [
			{
				label: 'Client IP Header',
				getValue: (d) => d.clientIpHeaderLeaked,
				valueClass: 'text-sky-300 font-semibold text-right',
				tooltip: 'Edge proxy headers revealing true client IP address.'
			},
			{
				label: 'Routing Path',
				getValue: (d) => (d.proxyChainDetected ? 'MULTI-HOP' : 'DIRECT'),
				valueClass: 'text-zinc-200',
				tooltip:
					'Detected edge reverse proxy hop hierarchy (Direct ingress vs multi-layer CDN routing).'
			},
			{
				label: 'Privacy Index',
				getValue: (d) => `${d.anonymityScore}/100`,
				valueClass: 'text-cyan-300 font-bold',
				tooltip: 'Composite edge privacy score evaluating proxy header exposure and routing hops.'
			}
		],
		meter: {
			getValue: (d) => d.anonymityScore,
			max: 100,
			variant: 'cyan',
			showValue: true,
			unit: '/100',
			label: 'Anonymity Index'
		}
	}),

	// [17] CONCURRENCY & EVENT LOOP
	defineVector({
		id: 17,
		title: '[17] Concurrency & Event Loop',
		domain: 'server',
		icon: CircleGauge,
		variant: 'server',
		selector: (s) => s.concurrency,
		fields: [
			{
				label: 'Event Loop Lag',
				getValue: (d) => `${d.eventLoopLagMs.toFixed(3)} ms`,
				valueClass: 'text-emerald-300 font-semibold',
				tooltip: 'Microtask queue scheduling lag indicating main thread CPU contention.'
			},
			{
				label: 'Sync 20ms Burn',
				getValue: (d) => `${d.syncBurnOps.toLocaleString()} ops`,
				valueClass: 'text-purple-300 font-semibold',
				tooltip: 'Number of tight synchronous arithmetic loop iterations executed in a 20ms burst.'
			}
		],
		meter: {
			getValue: (d) => Math.max(5, Math.min(100, Math.round(100 - d.eventLoopLagMs * 20))),
			max: 100,
			variant: 'emerald',
			label: 'Scheduler Responsiveness'
		}
	}),

	// [18] CLIENT PRIVACY MATRIX
	defineVector({
		id: 18,
		title: '[18] Client Privacy Matrix',
		domain: 'client',
		icon: ScanEye,
		variant: 'client',
		selector: (s) => s.client,
		fields: [
			{
				label: 'Cores / Threads',
				getValue: (d) => `${d.cores} Cores`,
				valueClass: 'text-zinc-200 font-semibold',
				tooltip: 'Logical CPU hardware concurrency cores exposed to clientside JavaScript.'
			},
			{
				label: 'Audio Farbling',
				getValue: (d) => (d.audio.isAudioFarbled ? 'FARBLE ACTIVE' : 'UNALTERED'),
				valueClass: (d) =>
					d.audio.isAudioFarbled ? 'text-amber-300 font-semibold' : 'text-zinc-400 font-semibold',
				tooltip:
					'Anti-fingerprinting protection injecting sub-perceptual floating-point noise into Web Audio oscillators.'
			},
			{
				label: 'System Fonts',
				getValue: (d) => `${d.fonts.detectedFontCount} detected`,
				valueClass: 'text-teal-300 font-semibold',
				tooltip:
					'Detected local installed font metrics probed via canvas font measurement side-channel.'
			},
			{
				label: 'GPU Renderer',
				getValue: (d) => formatGpuRenderer(d.gpu.renderer),
				valueClass: 'text-cyan-300 font-semibold text-right text-[11px]',
				tooltip: 'Unmasked WebGL GPU Renderer.'
			}
		],
		meter: {
			getValue: (d) => (d.fonts.detectedFontCount > 10 ? 75 : 25),
			max: 100,
			variant: 'teal',
			label: 'Entropic Footprint'
		}
	}),

	// [19] CLIENT HINTS (UA-CH)
	defineVector({
		id: 19,
		title: '[19] Client Hints (UA-CH)',
		domain: 'client',
		icon: Cpu,
		variant: 'client',
		selector: (s) => s.client?.clientHints,
		fields: [
			{
				label: 'Platform',
				getValue: (d) => d.platform,
				valueClass: 'text-sky-300 font-semibold',
				tooltip: 'Client operating system platform reported by User-Agent Client Hints.'
			},
			{
				label: 'Architecture',
				getValue: (d) => d.architecture,
				valueClass: 'text-zinc-100 font-semibold',
				tooltip: 'High-entropy CPU architecture data exposed via navigator.userAgentData.'
			},
			{
				label: 'Bitness',
				getValue: (d) => `${d.bitness}-bit`,
				valueClass: 'text-emerald-300 font-semibold',
				tooltip: 'Reported processor bitness (64-bit or 32-bit).'
			}
		],
		meter: {
			getValue: () => 100,
			max: 100,
			variant: 'teal',
			label: 'UA-CH Client Fidelity'
		}
	}),

	// [20] NETWORK CONNECTION API
	defineVector({
		id: 20,
		title: '[20] Network Connection API',
		domain: 'client',
		icon: Radio,
		variant: 'client',
		selector: (s) => s.client?.connection,
		fields: [
			{
				label: 'Effective Type',
				getValue: (d) => d.effectiveType,
				valueClass: 'text-cyan-300 font-bold',
				tooltip: 'Inferred cellular/broadband connection generation (e.g. 4g, 5g, wifi).'
			},
			{
				label: 'Downlink Speed',
				getValue: (d) => `${d.downlinkMb} MB/s`,
				valueClass: 'text-emerald-300 font-semibold',
				tooltip: 'Estimated downlink bandwidth throughput provided by Network Information API.'
			},
			{
				label: 'Client RTT',
				getValue: (d) => `${d.rttMs} ms`,
				valueClass: 'text-zinc-200',
				tooltip: 'Estimated round-trip time latency for client connection.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, Math.round((d.downlinkMb || 10) * 8)),
			max: 100,
			variant: 'cyan',
			label: 'Downlink Saturation'
		}
	}),

	// [21] SUBRESOURCE TIMING
	defineVector({
		id: 21,
		title: '[21] Subresource Timing',
		domain: 'client',
		icon: Layers,
		variant: 'client',
		selector: (s) => s.client?.resourceTiming,
		fields: [
			{
				label: 'Subresources',
				getValue: (d) => `${d.subresourceCount} assets`,
				valueClass: 'text-zinc-200 font-semibold',
				tooltip: 'Total subresource network entries recorded via PerformanceResourceTiming.'
			},
			{
				label: 'Mean TTFB',
				getValue: (d) => `${d.avgTtfbMs} ms`,
				valueClass: 'text-teal-300 font-semibold',
				tooltip: 'Average Time to First Byte across loaded scripts, styles, and fetch requests.'
			},
			{
				label: 'Total Transferred',
				getValue: (d) => formatBytesKb(d.totalTransferKb),
				valueClass: 'text-cyan-300 font-semibold',
				tooltip: 'Cumulative encoded byte transfer volume for page assets.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, d.subresourceCount * 4),
			max: 100,
			variant: 'teal',
			label: 'Resource Pipeline Density'
		}
	}),

	// [22] WEBRTC ICE DISCOVERY
	defineVector({
		id: 22,
		title: '[22] WebRTC ICE Discovery',
		domain: 'client',
		icon: Network,
		variant: 'client',
		selector: (s) => s.client?.webrtc,
		fields: [
			{
				label: 'STUN Gathering',
				getValue: (d) => `${d.iceGatheringDurationMs} ms`,
				valueClass: 'text-purple-300 font-semibold',
				tooltip: 'Interactive Connectivity Establishment (ICE) candidate gathering duration.'
			},
			{
				label: 'Candidates',
				getValue: (d) => `${d.candidateCount} detected`,
				valueClass: 'text-emerald-300 font-semibold',
				tooltip: 'Discovered network interface candidates (host, server reflexive srflx, relay).'
			},
			{
				label: 'Candidate Types',
				getValue: (d) => d.candidateTypes.join(', '),
				valueClass: 'text-zinc-200 font-semibold text-right',
				tooltip: 'List of discovered ICE network routing candidate protocols.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, d.candidateCount * 25),
			max: 100,
			variant: 'purple',
			label: 'ICE Route Candidates'
		}
	}),

	// [23] NETWORK PACKET JITTER
	defineVector({
		id: 23,
		title: '[23] Network Packet Jitter',
		domain: 'client',
		icon: Flame,
		variant: 'client',
		selector: (s) => s.client?.networkJitter,
		fields: [
			{
				label: 'Ping Jitter',
				getValue: (d) => `${d.pingJitterMs} ms`,
				valueClass: 'text-sky-300 font-semibold',
				tooltip: 'Standard deviation of packet round-trip times across multi-sample ping sweep.'
			},
			{
				label: 'Ping Range',
				getValue: (d) => `${d.minPingMs} - ${d.maxPingMs} ms`,
				valueClass: 'text-zinc-200',
				tooltip: 'Minimum and maximum recorded ping round-trip times.'
			},
			{
				label: 'Stability Rating',
				getValue: (d) => d.packetStability,
				valueClass: (d) => `${getJitterStabilityClass(d.packetStability)} text-right`,
				tooltip: 'Packet timing consistency rating evaluating jitter stability.'
			}
		],
		meter: {
			getValue: (d) => Math.max(10, Math.min(100, Math.round(100 - d.pingJitterMs * 10))),
			max: 100,
			variant: 'cyan',
			label: 'Line Stability Index'
		}
	}),

	// [24] LONG TASKS & THREAD LAG
	defineVector({
		id: 24,
		title: '[24] Long Tasks & Thread Lag',
		domain: 'client',
		icon: TriangleAlert,
		variant: 'client',
		selector: (s) => s.client?.longTasks,
		fields: [
			{
				label: 'Long Tasks (>50ms)',
				tooltip: 'PerformanceObserver monitoring main thread task stalls exceeding 50ms.',
				getBadge: (d) => ({
					text: `${d.longTaskCount} BLOCKS`,
					variant: d.longTaskCount === 0 ? 'emerald' : 'rose'
				})
			},
			{
				label: 'Max Duration',
				getValue: (d) => `${d.maxTaskDurationMs} ms`,
				valueClass: (d) =>
					d.maxTaskDurationMs > 0
						? 'text-rose-300 font-semibold'
						: 'text-emerald-300 font-semibold',
				tooltip: 'Duration of the single longest blocking main-thread stall.'
			},
			{
				label: 'Total Blocking Time',
				getValue: (d) => `${d.totalBlockingTimeMs} ms`,
				valueClass: (d) =>
					d.totalBlockingTimeMs > 0
						? 'text-amber-300 font-semibold'
						: 'text-emerald-300 font-semibold',
				tooltip: 'Cumulative main thread stall duration across all long tasks.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, d.totalBlockingTimeMs),
			max: 100,
			variant: (d) => (d.longTaskCount === 0 ? 'emerald' : 'rose'),
			showValue: true,
			unit: ' ms',
			label: 'Thread Total Blocking Time'
		}
	}),

	// [25] rAF REFRESH & FRAME DROPS
	defineVector({
		id: 25,
		title: '[25] rAF Refresh & Frame Drops',
		domain: 'client',
		icon: MonitorPlay,
		variant: 'client',
		selector: (s) => s.client?.frameTiming,
		fields: [
			{
				label: 'Target Display',
				getValue: (d) => `${d.estimatedRefreshRateHz} Hz`,
				valueClass: 'text-amber-300 font-bold',
				tooltip: 'Inferred physical display panel refresh rate (60Hz, 120Hz, 144Hz, 240Hz).'
			},
			{
				label: 'Realtime FPS',
				getValue: (d) => `${d.realtimeFps} FPS`,
				valueClass: 'text-emerald-300 font-bold',
				tooltip: 'Measured real-time rendering frame rate over 40 sampled animation ticks.'
			},
			{
				label: 'Dropped Frames',
				getValue: (d) => d.droppedFrames,
				valueClass: (d) => (d.droppedFrames > 0 ? 'text-rose-300 font-semibold' : 'text-zinc-400'),
				tooltip:
					'Count of dropped or delayed animation frames exceeding the frame interval threshold.'
			}
		],
		meter: {
			getValue: (d) => Math.round(d.realtimeFps),
			max: 144,
			variant: (d) => (d.droppedFrames > 0 ? 'amber' : 'emerald'),
			showValue: true,
			unit: ' FPS',
			label: 'Compositor Rendering FPS'
		}
	}),

	// [26] DOM LAYOUT THRASHING
	defineVector({
		id: 26,
		title: '[26] DOM Layout Thrashing',
		domain: 'client',
		icon: Grid3x3,
		variant: 'client',
		selector: (s) => s.client?.layoutThrashing,
		fields: [
			{
				label: 'Reflow Throughput',
				getValue: (d) => `${d.opsPerSec.toLocaleString()} ops/s`,
				valueClass: 'text-orange-300 font-bold',
				tooltip:
					'Forced synchronous layout calculation throughput under high DOM mutation pressure.'
			},
			{
				label: 'Mean Reflow Time',
				getValue: (d) => `${d.avgReflowMs} ms`,
				valueClass: 'text-zinc-100 font-semibold',
				tooltip: 'Average duration per forced synchronous reflow style recalculation.'
			},
			{
				label: 'Benchmark Run',
				getValue: (d) => `${d.totalBenchmarkMs} ms`,
				valueClass: 'text-zinc-300',
				tooltip: 'Total duration for 50 forced layout calculation benchmark iterations.'
			}
		],
		meter: {
			getValue: (d) => Math.min(100, Math.round(d.opsPerSec / 80)),
			max: 100,
			variant: 'orange',
			label: 'Layout Mutation Speed'
		}
	})
];
