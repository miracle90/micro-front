import { reroute } from "../navigations/reroute";
import {
  BOOTSTRAPPING,
  LOADING_SOURCE_CODE,
  MOUNTED,
  NOT_BOOTSTRAPPED,
  NOT_LOADED,
  NOT_MOUNTED,
  shouldBeActive,
  SKIP_BECAUE_BROKEN,
} from "./app.helpers";

/**
 *
 * @param {*} appName 应用名字
 * @param {*} loadApp 加载的应用
 * @param {*} activeWhen 当激活时会调用 loadApp
 * @param {*} customProps 自定义属性
 */

const apps = []; // 用来存放所有的应用

// 维护应用所有的状态 => 状态机
export function registerApplication(appName, loadApp, activeWhen, customProps) {
  apps.push({
    name: appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED,
  });
  // 生命周期
  reroute(); // 加载应用
}

export function getAppchanges() {
  const appsToUnmount = []; // 要卸载的app
  const appsToLoad = []; // 要加载的app
  const appsToMount = []; // 要挂载的app
  apps.forEach((app) => {
    // 需不需要被加载
    // const appShouldBeActive = app.status !== SKIP_BECAUE_BROKEN && shouldBeActive(app)
    const appShouldBeActive = shouldBeActive(app);
    switch (app.status) {
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }
        break;
      case NOT_BOOTSTRAPPED:
      case BOOTSTRAPPING:
      case NOT_MOUNTED:
        if (appShouldBeActive) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED:
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
      default:
        break;
    }
  });
  return {
    appsToLoad,
    appsToMount,
    appsToUnmount,
  };
}
