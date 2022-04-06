module.exports = {
  configureWebpack: {
    output: {
      library: "singleVue",
      libraryTarget: "umd", // window.singleVue.bootstrap
    },
    devServer: {
      port: 10000,
    },
  },
};
