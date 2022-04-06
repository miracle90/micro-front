import { reroute } from "./navigations/reroute";

export let started = false;

export function start() {
  // 需要挂载
  started = true;
  reroute(); // 除了取加载应用还需要去挂载应用
}
