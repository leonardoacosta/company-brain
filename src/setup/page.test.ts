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
	loginOnly: false,
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

describe("setupPage login-only mode", () => {
	it("finishes setup after credentials and sign-in without bot installation", () => {
		const html = setupPage({
			...params,
			hasMemoryBaseURL: true,
			slackConfigured: true,
			signedIn: true,
			loginOnly: true,
		})

		expect(html).toContain("Setup complete")
		expect(html).not.toContain("Install the Slack app")
		expect(html).not.toContain("slack/events")
	})

	it("explains login-only app scopes and callback", () => {
		const html = setupPage({ ...params, loginOnly: true, hasMemoryBaseURL: true })

		expect(html).toContain("<code>openid email profile</code>")
		expect(html).toContain("/auth/slack/callback")
		expect(html).not.toContain("bot scopes")
		expect(html).not.toContain("Install to Workspace")
	})
})
