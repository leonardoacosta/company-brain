import Supermemory from "supermemory"

const clients = new WeakMap<object, Supermemory>()

/**
 * The brain's memory lives in Supermemory's hosted API.
 * One client per Env so connections and config are reused across a request.
 */
export function isAllowedSupermemoryBaseURL(value?: string): boolean {
	const baseURL = value?.trim()
	if (!baseURL) return false
	try {
		const url = new URL(baseURL)
		return (
			baseURL === "https://api.supermemory.ai" &&
			url.href === "https://api.supermemory.ai/" &&
			!url.username &&
			!url.password
		)
	} catch {
		return false
	}
}

export function memoryClient(env: Env): Supermemory {
	const existing = clients.get(env as unknown as object)
	if (existing) return existing
	if (!env.SUPERMEMORY_API_KEY?.trim()) {
		throw new Error(
			"SUPERMEMORY_API_KEY is not set — the brain has nowhere to read or write memory.",
		)
	}
	const baseURL = env.SUPERMEMORY_BASE_URL?.trim()
	if (!baseURL) {
		throw new Error(
			"SUPERMEMORY_BASE_URL is not set — hosted memory endpoint must be configured.",
		)
	}
	if (!isAllowedSupermemoryBaseURL(baseURL)) {
		throw new Error(
			"SUPERMEMORY_BASE_URL must be exactly https://api.supermemory.ai.",
		)
	}
	const client = new Supermemory({
		apiKey: env.SUPERMEMORY_API_KEY,
		baseURL,
	})
	clients.set(env as unknown as object, client)
	return client
}
