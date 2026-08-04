import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Mirrors the `@/*` -> `./src/*` mapping in tsconfig.json. Without it, any test
// importing a module that uses the alias fails to resolve — which is why this
// only became necessary once a test covered src/app/sitemap.ts, the first
// tested module to import via `@/`.
export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
