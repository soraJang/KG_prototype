<template>
  <div class="panel-wrap">
    <button @click="toggleOptionPanel">Click</button>
  </div>
</template>

<script setup lang="ts">
const toggleOptionPanel = () => {
  console.log("btn click");
};
</script>

<style lang="scss">
div.panel-wrap {
  height: 50px;
  width: 50px;
  position: absolute;
  right: 0px;
  bottom: 0px;
}
</style>
