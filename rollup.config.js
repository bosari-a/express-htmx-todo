// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/server.ts",
  output: {
    file: "server.js",
    format: "esm",
  },
  plugins: [typescript()],
  watch: true,
};
