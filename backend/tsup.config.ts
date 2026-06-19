import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  outDir: "dist",
  clean: true,
  skipNodeModulesBundle: true,
  sourcemap: false,
  minify: false,
}); 