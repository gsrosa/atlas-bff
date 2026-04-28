import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/trpc/builder/index.ts"],
  outDir: "src/trpc/builder/api-types",
  format: ["esm"],
  clean: true,
  dts: true,
  tsconfig: "src/trpc/builder/tsconfig.build.json",
  bundle: false, // Preserve module structure for better type resolution
  splitting: false,
});
