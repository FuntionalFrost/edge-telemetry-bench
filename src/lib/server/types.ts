// src/lib/server/types.ts
import type { ChunkDataMap, DiagnosticChunkType } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';

export interface ProbeContext {
	request: RequestEvent['request'];
}

export interface DiagnosticProbe<T extends Exclude<DiagnosticChunkType, 'panic'>> {
	type: T;
	run: (ctx: ProbeContext) => Promise<ChunkDataMap[T]>;
}
