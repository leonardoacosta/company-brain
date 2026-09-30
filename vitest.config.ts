import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
	test: {
		server: { deps: { inline: ["@cloudflare/codemode"] } },
	},
	resolve: {
		alias: [
			{ find: /^cloudflare:workers$/, replacement: `${root}test/cloudflare-workers.ts` },
			{ find: /^@repo\/db\/schema\/(.*)$/, replacement: `${root}src/db/schema/$1` },
			{ find: "@repo/db/schema", replacement: `${root}src/db/schema/index.ts` },
			{ find: "@repo/db", replacement: `${root}src/db/index.ts` },
			{ find: /^@repo\/lib\/(.*)$/, replacement: `${root}src/compat/repo-lib/$1` },
			{ find: /^@repo\/validation\/(.*)$/, replacement: `${root}src/compat/validation/$1` },
			{ find: /^@\/services\/(.*)$/, replacement: `${root}src/compat/services/$1` },
			{ find: /^@\/routes\/(.*)$/, replacement: `${root}src/compat/routes/$1` },
			{ find: "@/lib/brain", replacement: `${root}src/brain` },
			{ find: "@/lib", replacement: `${root}src/compat/lib` },
			{ find: "@/", replacement: `${root}src/` },
		],
	},
})
