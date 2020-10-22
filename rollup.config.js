import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonJS from "@rollup/plugin-commonjs";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
  },
  plugins: [typescript(), resolve(), commonJS()],
};
