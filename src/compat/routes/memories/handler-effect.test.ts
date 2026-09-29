import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { describe, expect, it, vi } from "vitest"
import { VectorDBService } from "../../services/vectordb"
import { addMemorySingle } from "./handler-effect"

describe("addMemorySingle", () => {
	it("forwards taskType memory to Supermemory documents.add", async () => {
		const add = vi.fn().mockResolvedValue({ id: "doc-1", status: "done" })
		const client = { documents: { add } } as never
		const result = await Effect.runPromise(
			addMemorySingle({
				org: { id: "org-1" },
				requestParams: { content: "A durable fact", taskType: "memory" },
			}).pipe(Effect.provide(Layer.succeed(VectorDBService, client))),
		)

		expect(add).toHaveBeenCalledWith({
			content: "A durable fact",
			taskType: "memory",
		})
		expect(result).toEqual({ id: "doc-1", status: "done" })
	})
})
