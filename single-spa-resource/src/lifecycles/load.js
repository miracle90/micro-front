import {
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
} from "../applications/app.helpers";

function flattenFnArray(funcs) {
  funcs = Array.isArray(funcs) ? funcs : [funcs];
  // 通过promise链来链式调用，多个方法组合成一个方法
  return (props) =>
    funcs.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve());
}

export async function toLoadPromise(app) {
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
