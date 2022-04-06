import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

let instance = null;

function render(props = {}) {
  const { container } = props;
  console.log(container);
  instance = new Vue({
    router,
    render: (h) => h(App),
    // 挂载到自己的html中，基座会拿到这个挂载后的html，将其插入进去
  }).$mount(container ? container.querySelector("#app") : "#app");
}

if (!window.__POWERED_BY_QIANKUN__) {
  render(); // 默认独立运行
} else {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__; // 动态添加publicPath
}

// 子应用暴露三个接口
export async function bootstrap() {
  console.log("vue app bootstraped");
}
export async function mount(props) {
  console.log("vue app mount", props);
  render(props);
}
export async function unmount(props) {
  console.log("vue app unmount", props);
  instance.$destroy(props);
}
