import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import singleSpaVue from "single-spa-vue";

Vue.config.productionTip = false;

const appOptions = {
  el: "#vue", // 挂载到父应用中的id为vue的标签中
  router,
  render: (h) => h(App),
};

const vueLifeCycle = singleSpaVue({
  Vue,
  appOptions,
});

// new Vue({
//   router,
//   render: h => h(App)
// }).$mount('#app')

// 我们需要父应用加载子应用
// 暴露三个接口
// bootstrap mount unmount
// single-spa/single-spa-vue

// 如果是父应用引用我
if (window.singleSpaNavigate) {
  __webpack_public_path__ = "http://localhost:10000";
} else {
  // 子应用单独运行
  delete appOptions.el;
  // 挂载到app上
  new Vue(appOptions).$mount("#app");
}

console.log(vueLifeCycle)

// 协议接入
export const bootstrap = vueLifeCycle.bootstrap;
export const mount = vueLifeCycle.mount;
export const unmount = vueLifeCycle.unmount;

// 将子应用打包成一个个的lib，给父应用使用
