import { getAppchanges } from "../applications/app";
import { toBootstrapPromise } from "../lifecycles/bootstrap";
import { toLoadPromise } from "../lifecycles/load";
import { toMountPromise } from "../lifecycles/mount";
import { toUnmountPromise } from "../lifecycles/unmount";
import { started } from "../start";
import './navigator-events'

// 核心应用处理方法
export function reroute() {
  // 获取需要被加载的应用
  // 获取需要被挂载的应用
  // 哪些应用需要被卸载
  const { appsToLoad, appsToMount, appsToUnmount } = getAppchanges();
  // start方法调用时是同步的，但是加载流程是异步的
  if (started) {
    // app装载
    return performAppChanges(); // 根据路径来装载应用
  } else {
    // 注册应用时，需要预先加载
    return loadApps(); // 预加载应用
  }

  // 预加载应用
  async function loadApps() {
    // 获取到 bootstrap mount unmount 方法，放到app上
    let apps = await Promise.all(appsToLoad.map(toLoadPromise));
  }
  // 根据路径来装载应用
  async function performAppChanges() {
    // 先卸载不需要的应用
    let unmountPromises = appsToUnmount.map(toUnmountPromise); // 需要去卸载的app
    // 去加载需要的应用
    appsToLoad.map(async (app) => {
      // 将需要取加载的应用拿到 => 加载 => 启动 => 挂载
      app = await toLoadPromise(app);
      app = await toBootstrapPromise(app);
      return toMountPromise(app);
    });
    appsToMount.map(async (app) => {
      app = await toBootstrapPromise(app);
      return toMountPromise(app);
    });
  }
}

// 这个流程是用于初始化操作的，我们还需要当路径切换时，重新加载应用

// 重写路由相关的方法
