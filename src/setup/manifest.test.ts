import { describe, expect, it } from "vitest"
import { slackAppManifest } from "./manifest"

describe("slackAppManifest", () => {
	it("keeps the full Slack integration manifest by default", () => {
		const manifest = slackAppManifest("https://brain.example")

		expect(manifest.oauth_config.scopes.bot).toContain("chat:write")
		expect(manifest.settings.event_subscriptions?.bot_events).toContain("app_mention")
	})

	it("emits only OIDC scopes and callback for login-only deployments", () => {
		const manifest = slackAppManifest("https://brain.example", undefined, true)

		expect(manifest.oauth_config.scopes).toEqual({ user: ["openid", "email", "profile"] })
		expect(manifest.oauth_config.redirect_urls).toEqual([
			"https://brain.example/auth/slack/callback",
		])
		expect(manifest.settings.event_subscriptions).toBeUndefined()
		expect(manifest.settings.interactivity).toBeUndefined()
		expect(manifest.features?.bot_user).toBeUndefined()
	})
})
