(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
})(this, (function (exports) { 'use strict';

  // 描述应用的整个状态
  const NOT_LOADED = "NOT_LOADED"; // 应用初始状态
  const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 加载资源
  const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 还没有调用bootstrap方法
  const BOOTSTRAPPING = "BOOTSTRAPPING"; // 启动中
  const NOT_MOUNTED = "NOT_MOUNTED"; // 没有调用mount方法
  const MOUNTING = "MOUNTING"; // 正在挂载中
  const MOUNTED = "MOUNTED"; // 挂在完毕
  const UNMOUNTING = "UNMOUNTING"; // 解除挂载

  // 当前这个应用是否要被激活
  function shouldBeActive(app) {
    // 如果返回 true，那么应用就开始初始化等一系列操作
    return app.activeWhen(window.location);
  }

  async function toBootstrapPromise(app) {
    if (app.status !== NOT_BOOTSTRAPPED) {
      return app;
    }
    app.status = BOOTSTRAPPING;
    await app.bootstrap(app.customProps);
    app.status = NOT_MOUNTED;
    return app;
  }

  function flattenFnArray(funcs) {
    funcs = Array.isArray(funcs) ? funcs : [funcs];
    // 通过promise链来链式调用，多个方法组合成一个方法
    return (props) =>
      funcs.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve());
  }

  async function toLoadPromise(app) {
    if (app.loadPromise) {
      return app.loadPromise;
    }
    return (app.loadPromise = Promise.resolve().then(async () => {
      app.status = LOADING_SOURCE_CODE;
      let { bootstrap, mount, unmount } = await app.loadApp(app.customProps);
      app.status = NOT_BOOTSTRAPPED; // 没有调用bootstrap方法
      // 将多个promise组合在一起，compose
      app.bootstrap = flattenFnArray(bootstrap);
      app.mount = flattenFnArray(mount);
      app.unmount = flattenFnArray(unmount);
      delete app.loadPromise;
      return app;
    }));
  }

  async function toMountPromise(app) {
    if (app.status !== NOT_MOUNTED) {
      return app;
    }
    app.status = MOUNTING;
    await app.mount(app.customProps);
    app.status = MOUNTED;
    return app;
  }

  async function toUnmountPromise(app) {
    // 当前应用没有被挂载，直接什么都不做
    if (app.status !== MOUNTED) {
      return app;
    }
    app.status = UNMOUNTING;
    await app.unmount(app.customProps);
    app.status = NOT_MOUNTED;
    return app;
  }

  let started = false;

  function start() {
    // 需要挂载
    started = true;
    reroute(); // 除了取加载应用还需要去挂载应用
  }

  // hashChange popstate
  const routingEventsListeningTo = ["hashchange", "popstate"];

  function urlReroute() {
    reroute(); // 会根据路径重新加载不同的应用
  }

  const capturedEventListeners = {
    // 后续挂载的事件先暂存起来
    hashchanage: [],
    popstate: [], // 当应用切换完成后可以调用
  };

  // 我们处理应用加载的逻辑是在最前面
  window.addEventListener("hashchange", urlReroute);
  window.addEventListener("popstate", urlReroute);

  const originalAddevnetListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  window.addEventListener = function (eventName, fn) {
    if (
      routingEventsListeningTo.indexOf(eventName) > -1 &&
      !capturedEventListeners[eventName].some((listener) => listener === fn)
    ) {
      capturedEventListeners[eventName].push(fn);
      return;
    }
    return originalAddevnetListener.apply(this, arguments);
  };

  window.removeEventListener = function (eventName, fn) {
    if (routingEventsListeningTo.indexOf(eventName) > -1) {
      capturedEventListeners[eventName] = capturedEventListeners[
        eventName
      ].filter((l) => l !== fn);
      return;
    }
    return originalRemoveEventListener.apply(this, arguments);
  };

  function patchedUpdateState(updateState, methodName) {
    return function () {
      const urlBefore = window.location.href;
      updateState.apply(this, arguments); // 调用切换方法
      const urlAfter = window.location.href;
      if (urlBefore !== urlAfter) {
        // 重新加载应用，传入事件源
        urlReroute(new PopStateEvent('popstate'));
      }
    };
  }

  // 如果是hash路由，hash变化时可以切换
  // 浏览器路由是基于h5 api，如果切换时，不会触发popstate
  window.history.pushState = patchedUpdateState(
    window.history.pushState);
  window.history.replaceState = patchedUpdateState(
    window.history.replaceState);

  // 用户还会绑定自己的路由事件 vue
  // 当我们应用切换后，还需要处理原先的方法 vue-router，需要在应用切换后再执行

  // 核心应用处理方法
  function reroute() {
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
      await Promise.all(appsToLoad.map(toLoadPromise));
    }
    // 根据路径来装载应用
    async function performAppChanges() {
      // 先卸载不需要的应用
      appsToUnmount.map(toUnmountPromise); // 需要去卸载的app
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

  /**
   *
   * @param {*} appName 应用名字
   * @param {*} loadApp 加载的应用
   * @param {*} activeWhen 当激活时会调用 loadApp
   * @param {*} customProps 自定义属性
   */

  const apps = []; // 用来存放所有的应用

  // 维护应用所有的状态 => 状态机
  function registerApplication(appName, loadApp, activeWhen, customProps) {
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

  function getAppchanges() {
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
      }
    });
    return {
      appsToLoad,
      appsToMount,
      appsToUnmount,
    };
  }

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=single-spa.js.map
