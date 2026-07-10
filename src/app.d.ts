// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			// Cloudflare specific execution context and bindings
			env?: Record<string, unknown>;
			context?: {
				waitUntil(promise: Promise<unknown>): void;
				passThroughOnException(): void;
			};
			caches?: CacheStorage;
		}
	}

	// Declare Deno namespace for Netlify Edge runtime static analysis
	const Deno: unknown;
}

export {};
