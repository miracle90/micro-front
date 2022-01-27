module.exports = {
  configureWebpack: {
    output: {
      library: "singleVue",
      libraryTarget: "umd",
    },
    devServer: {
      port: 10000,
    },
  },
};

// window.singleVue.bootstrap
