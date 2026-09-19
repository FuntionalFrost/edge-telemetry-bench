// src/lib/client/types.ts
import type { ClientHardwareMetrics } from '$lib/types';

export interface ClientProbe<K extends keyof ClientHardwareMetrics = keyof ClientHardwareMetrics> {
	key: K;
	name: string;
	run: () => Promise<ClientHardwareMetrics[K]>;
}
