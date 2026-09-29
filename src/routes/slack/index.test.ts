import { describe, expect, it, vi } from "vitest"
import { Hono } from "hono"
vi.mock("agents", () => ({ getAgentByName: vi.fn() }))
vi.mock("../../setup/config-store", () => ({ slackCredentials: vi.fn() }))
vi.mock("@/lib/payments/company-brain-entitlement", () => ({
	getCompanyBrainEntitlement: vi.fn(),
}))
vi.mock("@/lib/brain/slack/account-link", () => ({
	completeSlackAccountLink: vi.fn(),
	getSlackAccountLinkPreview: vi.fn(),
	notifySlackAccountLinked: vi.fn(),
}))
vi.mock("@/lib/brain/slack/client", () => ({
	exchangeSlackOAuth: vi.fn(),
	postSlackMessage: vi.fn(),
	updateSlackInteractionResponse: vi.fn(),
}))
import type { AppContext } from "@/types"
import { slackRoutes } from "./index"

describe("Slack bot install", () => {
	it("rejects installation in login-only mode before creating OAuth state", async () => {
		const put = vi.fn()
		const app = new Hono<AppContext>()
		app.use("*", async (c, next) => {
			c.set("org", { id: "org_1", name: "Org", slug: "org", createdAt: new Date() })
			c.set("user", { id: "user_1", email: "test@example.com", name: "Test", createdAt: new Date(), updatedAt: new Date() })
			c.set("memberRole", "owner")
			await next()
		})
		app.route("/", slackRoutes)

		const response = await app.request("/oauth/install", {}, {
			SLACK_LOGIN_ONLY: "true",
			BRAIN_KV: { put } as never,
		} as unknown as Env)

		expect(response.status).toBe(403)
		expect(await response.json()).toEqual({
			error: "Slack bot installation is disabled in login-only mode",
		})
		expect(put).not.toHaveBeenCalled()
	})
})
