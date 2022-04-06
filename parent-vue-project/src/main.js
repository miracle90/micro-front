import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { registerApplication, start } from "single-spa";

// 动态引入script
async function loadScript(url) {
  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// singleSpa缺陷，不够灵活，不能动态加载js文件
// 样式不隔离
// 没有js沙箱的机制

// 注册应用
registerApplication(
  "myVueApp",
  async () => {
    console.log("加载模块");
    await loadScript("http://localhost:10000/js/chunk-vendors.js");
    await loadScript("http://localhost:10000/js/app.js");
    return window.singleVue; // bootstrap mount unmount
  },
  // 用户切换到/vue的路径下，需要加载刚才定义的子应用
  (location) => location.pathname.startsWith("/vue")
);

// 开启
start();

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
