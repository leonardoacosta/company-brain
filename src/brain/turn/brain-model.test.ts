import { streamText, tool } from "ai"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { availableProviders, brainProviderModel, getBrainModel, hasXai } from "./brain-model"

const omniEnv = {
	OMNI_BASE_URL: "http://omniroute:20128/v1",
	OMNI_MODEL: "test-tool-model",
	OMNI_API_KEY: "test-proxy-key",
} as Env

describe("Omni model provider", () => {
	it("only advertises Omni when all explicit settings are present", () => {
		expect(availableProviders(omniEnv)).toEqual(["omni"])
		for (const partial of [
			{ ...omniEnv, OMNI_MODEL: "" },
			{ ...omniEnv, OMNI_BASE_URL: "" },
			{ ...omniEnv, OMNI_API_KEY: "" },
		]) {
			expect(() => availableProviders(partial as Env)).toThrow("Incomplete OmniRoute configuration")
		}
	})

	it("rejects unsafe endpoints without echoing credentials", () => {
		for (const baseURL of ["file:///tmp/secret", "https://user:pass@host/v1", "https://host/v1?token=hidden", "https://host/v1#fragment"]) {
			expect(() => availableProviders({ ...omniEnv, OMNI_BASE_URL: baseURL } as Env)).toThrow("Invalid OmniRoute base URL")
		}
	})

	it("sends an OpenAI-compatible streamed tool call to the configured gateway", async () => {
		let requestBody: Record<string, unknown> | undefined
		const originalFetch = globalThis.fetch
		const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
			requestBody = JSON.parse(String(init?.body))
			return new Response(
				'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","created":1,"model":"test-tool-model","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_1","type":"function","function":{"name":"lookup","arguments":"{\\"query\\":\\"hello\\"}"}}]},"finish_reason":null}]}\n\ndata: {"id":"chatcmpl-test","object":"chat.completion.chunk","created":1,"model":"test-tool-model","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\ndata: [DONE]\n\n',
				{ headers: { "Content-Type": "text/event-stream" } },
			)
		})
		globalThis.fetch = fetchMock as typeof fetch
		const result = streamText({
			model: brainProviderModel("claude-sonnet-5", omniEnv),
			prompt: "Call the lookup tool",
			tools: { lookup: tool({ inputSchema: z.object({ query: z.string() }) }) },
			abortSignal: AbortSignal.timeout(2_000),
		})
		try {
			const steps = await result.steps
			expect(fetchMock).toHaveBeenCalled()
			expect(requestBody).toMatchObject({ model: "test-tool-model", stream: true })
			expect(requestBody?.tools).toEqual(expect.arrayContaining([expect.objectContaining({ function: expect.objectContaining({ name: "lookup" }) })]))
			expect(steps[0]?.toolCalls).toMatchObject([{ toolName: "lookup", input: { query: "hello" } }])
		} finally {
			globalThis.fetch = originalFetch
		}
	})

	it("prefers Omni over other keys and Cloudflare gateway", () => {
		const env = {
			...omniEnv,
			ANTHROPIC_API_KEY: "other-key",
			CLOUDFLARE_ACCOUNT_ID: "account",
			AI_GATEWAY_NAME: "gateway",
			AI_GATEWAY_TOKEN: "gateway-token",
		} as Env
		expect(hasXai(env)).toBe(false)
		expect(getBrainModel("claude-sonnet-5", env)).toMatchObject({ specificationVersion: "v3" })
	})
})
