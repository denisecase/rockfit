import { defineConfig } from "vite";
export default defineConfig({
  json: {
    namedExports: true,
    stringify: false
  },
  server: { port: 5177 },
  build: { target: "es2020" },
  base: "/rockfit/"
});
