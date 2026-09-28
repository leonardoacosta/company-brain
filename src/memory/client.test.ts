import { describe, expect, it } from "vitest"
import { isAllowedSupermemoryBaseURL, memoryClient } from "./client"

describe("memoryClient", () => {
	it("allows only the canonical hosted API origin", () => {
		expect(isAllowedSupermemoryBaseURL("https://api.supermemory.ai")).toBe(true)
		for (const baseURL of [
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

	it("accepts the hosted Supermemory API URL", () => {
		expect(() =>
			memoryClient({
				SUPERMEMORY_API_KEY: "probe-key",
				SUPERMEMORY_BASE_URL: "https://api.supermemory.ai",
			} as Env),
		).not.toThrow()
	})

	it("rejects noncanonical Supermemory URLs", () => {
		for (const baseURL of [
			"https://api.supermemory.ai/path",
			"https://api.supermemory.ai?query=1",
			"https://api.supermemory.ai#fragment",
			"https://api.supermemory.ai:443",
			"https://api.supermemory.ai.",
			"https://custom.supermemory.ai",
			"https://user:password@api.supermemory.ai",
		]) {
			expect(() =>
				memoryClient({
					SUPERMEMORY_API_KEY: "probe-key",
					SUPERMEMORY_BASE_URL: baseURL,
				} as Env),
			).toThrow("SUPERMEMORY_BASE_URL must be exactly https://api.supermemory.ai.")
		}
	})

	it("fails closed when the hosted Supermemory URL is missing", () => {
		expect(() =>
			memoryClient({
				SUPERMEMORY_API_KEY: "probe-key",
			} as Env),
		).toThrow("SUPERMEMORY_BASE_URL is not set — hosted memory endpoint must be configured.")
	})

	it("rejects a missing or blank API key", () => {
		for (const key of [undefined, "", "  "]) {
			expect(() =>
				memoryClient({
					SUPERMEMORY_API_KEY: key,
					SUPERMEMORY_BASE_URL: "https://api.supermemory.ai",
				} as Env),
			).toThrow("SUPERMEMORY_API_KEY is not set")
		}
	})

	it("uses the canonical hosted Supermemory URL", () => {
		const client = memoryClient({
			SUPERMEMORY_API_KEY: "probe-key",
			SUPERMEMORY_BASE_URL: "https://api.supermemory.ai",
		} as Env)

		expect(client.baseURL).toBe("https://api.supermemory.ai")
	})
})
