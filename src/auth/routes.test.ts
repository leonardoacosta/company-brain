import { describe, expect, it } from "vitest"
import { Hono } from "hono"
import { authRoutes } from "./routes"
import { sessionMiddleware } from "./session"
import { brainMemoriesRoutes } from "../routes/memories"

describe("login-only session readiness", () => {
	it("does not claim a session or authenticate protected API from configuration alone", async () => {
		const app = new Hono()
		app.use("*", sessionMiddleware)
		app.route("/auth", authRoutes)
		app.route("/brain/memories", brainMemoriesRoutes)
		const response = await app.request("/auth/session", {}, {
			SLACK_LOGIN_ONLY: "true",
			SLACK_CLIENT_ID: "client-id",
			SLACK_CLIENT_SECRET: "client-secret",
			SLACK_SIGNING_SECRET: "signing-secret",
		} as Env)

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({
			user: null,
			org: null,
			role: null,
			setupComplete: true,
		})
		const protectedResponse = await app.request("/brain/memories", {}, {
			SLACK_LOGIN_ONLY: "true",
		} as Env)
		expect(protectedResponse.status).toBe(401)
	})
})
