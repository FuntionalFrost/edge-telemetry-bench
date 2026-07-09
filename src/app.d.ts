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
			env?: Record<string, any>;
			context?: {
				waitUntil(promise: Promise<any>): void;
				passThroughOnException(): void;
			};
			caches?: any;
		}
	}

	// Declare Deno namespace for Netlify Edge runtime static analysis
	const Deno: any;
}

export {};
