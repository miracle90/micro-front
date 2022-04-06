import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { registerMicroApps, start } from "qiankun";

registerMicroApps([
  {
    name: "reactApp", // app name registered
    entry: "//localhost:20000",
    container: "#react",
    activeRule: "/react",
  },
  {
    name: "vueApp",
    entry: "//localhost:10000",
    container: "#vue",
    activeRule: "/vue",
  },
]);

start({
  prefetch: false,
});

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
