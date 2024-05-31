<template>
  <h3>CYTOSCAPE</h3>

  <cytoscape
    :node-data="dummy200Json.elements"
    :style-json="cytoscapeStore.graphStyle"
    :default-layout="'random'"
  ></cytoscape>
</template>

<script setup lang="ts">
import Cytoscape from "@comp/cytoscape.vue";
import dummy200Json from "./dummy_200.json";
import dummy1400Json from "./dummy_1400.json";
import style1400Json from "./style_1400.json";
import { useCytoscapeStore } from "@store/useCytoscapeStore";

const cytoscapeStore = useCytoscapeStore();
</script>

<style lang="scss"></style>
