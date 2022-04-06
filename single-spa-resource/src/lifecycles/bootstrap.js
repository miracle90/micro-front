import {
  BOOTSTRAPPING,
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
} from "../applications/app.helpers";

export async function toBootstrapPromise(app) {
  if (app.status !== NOT_BOOTSTRAPPED) {
    return app;
  }
  app.status = BOOTSTRAPPING;
  await app.bootstrap(app.customProps);
  app.status = NOT_MOUNTED;
  return app;
}
