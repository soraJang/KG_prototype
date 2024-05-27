<template>
  <h3>CYTOSCAPE</h3>

  <cytoscape
    :node-data="dummyJson.elements"
    :style-json="styleJson"
  ></cytoscape>
  <!--</template>-->
</template>

<script setup lang="ts">
import Cytoscape from "@comp/cytoscape.vue";
import dummyJson from "./dummy.json";
import styleJson from "./style.json";
</script>

<style lang="scss"></style>
