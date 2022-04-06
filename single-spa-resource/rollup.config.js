import serve from "rollup-plugin-serve";

// rullup可以帮我们打包es6模块化语法
export default {
  input: "./src/single-spa.js",
  output: {
    file: "./lib/umd/single-spa.js",
    format: "umd",
    name: "singleSpa",
    sourcemap: true,
  },
  plugins: [
    serve({
      openPage: "/index.html",
      contentBase: "",
      port: 3000,
    }),
  ],
};
