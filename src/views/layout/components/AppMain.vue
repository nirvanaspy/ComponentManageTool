<template>
  <div class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="$route.path"></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
export default {
  name: "AppMain",
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    }
    // key() {
    //   return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    // }
  }
}
</script>
<style>
.app-main {
  position: absolute;
  top: 80px;
  bottom: 0;
  width: calc(100% - 40px);
  overflow-y: auto;
  margin: 20px;
  /*background-color: rgba(127, 127, 127, 0.2);
    background-color: rgba(70,70,70,0.4);*/
  background-color: rgba(59, 160, 241, 0.2);
}
</style>
