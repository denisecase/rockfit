import { defineConfig } from "vite";
export default defineConfig({
  server: { port: 5177 },
  build: { target: "es2020" },
  base: "/rockfit/"
});
