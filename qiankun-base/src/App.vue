<template>
  <div id="app">
    <!-- 基座中可以放自己的路由 -->
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
    <!-- 也可以引用其他子应用 -->
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
