<template>
  <cytoscape
    :node-data="dummy200Json.elements"
    :style-json="cytoscapeStore.graphStyle"
    :default-layout="'concentric'"
  ></cytoscape>
</template>

<script setup lang="ts">
import Cytoscape from "@comp/cytoscape.vue";
import dummy200Json from "./dummy_200.json";
import { useCytoscapeStore } from "@store/useCytoscapeStore";

const cytoscapeStore = useCytoscapeStore();
</script>

<style lang="scss"></style>
