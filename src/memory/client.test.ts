import { describe, expect, it } from "vitest"
import { isAllowedSupermemoryBaseURL, memoryClient } from "./client"

describe("memoryClient", () => {
	it("allows only the private Supermemory service origin", () => {
		expect(isAllowedSupermemoryBaseURL("http://supermemory:6767")).toBe(true)
		for (const baseURL of [
			"https://api.supermemory.ai",
			"http://supermemory:6767/",
			"http://supermemory:6767/path",
			"http://user:password@supermemory:6767",
			"http://api.supermemory.ai",
			"https://supermemory.ai",
			"https://custom.supermemory.ai",
			"https://api.supermemory.ai.",
			"https://API.SUPERMEMORY.AI",
			"https://user:password@api.supermemory.ai",
			"https://api.supermemory.ai/path",
			"https://api.supermemory.ai/?",
			"https://api.supermemory.ai/#",
			"https://api.supermemory.ai:443",
			"ftp://api.supermemory.ai",
			"not a URL",
			" ",
		]) {
			expect(isAllowedSupermemoryBaseURL(baseURL), baseURL).toBe(false)
		}
	})

	it("accepts the private Supermemory service URL with its bearer key", () => {
		expect(() =>
			memoryClient({
				SUPERMEMORY_API_KEY: "local-probe-key",
				SUPERMEMORY_BASE_URL: "http://supermemory:6767",
			} as Env),
		).not.toThrow()
	})

	it("rejects noncanonical Supermemory URLs", () => {
		for (const baseURL of [
				"http://supermemory:6767/",
				"http://supermemory:6767/path",
				"http://supermemory:6767?query=1",
				"http://supermemory:6767#fragment",
				"https://api.supermemory.ai",
		]) {
			expect(() =>
				memoryClient({
					SUPERMEMORY_API_KEY: "probe-key",
					SUPERMEMORY_BASE_URL: baseURL,
				} as Env),
			).toThrow("SUPERMEMORY_BASE_URL must be exactly http://supermemory:6767.")
		}
	})

	it("fails closed when the private Supermemory URL is missing", () => {
		expect(() =>
			memoryClient({
				SUPERMEMORY_API_KEY: "probe-key",
			} as Env),
		).toThrow("SUPERMEMORY_BASE_URL is not set — private memory endpoint must be configured.")
	})

	it("rejects a missing or blank API key", () => {
		for (const key of [undefined, "", "  "]) {
			expect(() =>
				memoryClient({
					SUPERMEMORY_API_KEY: key,
					SUPERMEMORY_BASE_URL: "http://supermemory:6767",
				} as Env),
			).toThrow("SUPERMEMORY_API_KEY is not set")
		}
	})

	it("uses the private Supermemory URL", () => {
		const client = memoryClient({
			SUPERMEMORY_API_KEY: "probe-key",
			SUPERMEMORY_BASE_URL: "http://supermemory:6767",
		} as Env)

		expect(client.baseURL).toBe("http://supermemory:6767")
		expect(client.apiKey).toBe("probe-key")
	})
})
