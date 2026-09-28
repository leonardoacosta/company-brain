import { describe, expect, it } from "vitest"
import { setupPage } from "./page"

const params = {
	origin: "http://brain.local",
	databaseReady: true,
	pendingMigrations: [],
	migrationError: null,
	hasMemoryKey: true,
	hasMemoryBaseURL: false,
	memoryBaseURLConfigured: false,
	modelKeyUnrecognized: false,
	sandbox: null,
	providers: ["openai"],
	slackConfigured: false,
	signedIn: false,
	installedTeam: null,
	manifest: {},
}

describe("setupPage hosted memory configuration", () => {
	it("requires the canonical hosted URL", () => {
		const html = setupPage(params)

		expect(html).toContain("SUPERMEMORY_BASE_URL")
		expect(html).toContain("https://api.supermemory.ai")
		expect(html).toContain("<h2>Add your API keys</h2>")
	})

	it("completes the key step only when local memory URL is set", () => {
		const html = setupPage({ ...params, hasMemoryBaseURL: true })

		expect(html).toContain("Memory on hosted Supermemory")
		expect(html).not.toContain("SUPERMEMORY_BASE_URL")
	})

	it("explains when a configured memory URL is not canonical", () => {
		const html = setupPage({ ...params, memoryBaseURLConfigured: true })

		expect(html).toContain("must be exactly <code>https://api.supermemory.ai</code>")
		expect(html).not.toContain("SUPERMEMORY_BASE_URL</code> is missing")
		expect(html).not.toContain("Memory on local Supermemory")
	})

	it("keeps the key step incomplete when the memory URL is invalid", () => {
		const html = setupPage({ ...params, hasMemoryBaseURL: false })

		expect(html).toContain("https://api.supermemory.ai")
		expect(html).not.toContain("Memory on local Supermemory")
	})
})
