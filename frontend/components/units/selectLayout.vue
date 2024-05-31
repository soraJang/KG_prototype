<template>
  <div>
    <h4>Select Layout</h4>
    <select v-model="selectedLayout" @change="changeLayout">
      <option
        v-for="(value, name, index) in options"
        :value="name"
        :key="index"
      >
        {{ capitalizeFirstLetter(name) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from "vue";

const props = defineProps({
  defaultLayout: {
    type: String,
    required: true
  }
});
const emit = defineEmits(["setGraphLayout"]);

const selectedLayout = ref(props.defaultLayout);

let options: any = {
  preset: {
    name: "preset",

    fit: true,
    padding: 30,
    positions: undefined,
    zoom: undefined,
    pan: undefined,
    spacingFactor: undefined,
    animate: false,
    animationDuration: 500,
    animation: true,
    animateFilter: function (node: any, i: any) {
      return true;
    },
    animationEasing: "ease-in",
    ready: undefined,
    stop: undefined,
    transform: function (node: any, position: any) {
      return position;
    }
  },
  grid: {
    name: "grid",

    fit: true,
    padding: 30,
    boundingBox: undefined,
    avoidOverlap: true,
    avoidOverlapPadding: 10,
    nodeDimensionsIncludeLabels: false,
    spacingFactor: undefined,
    condense: false,
    rows: undefined,
    cols: undefined,
    position: function (node: any) {},
    sort: undefined,
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in",
    animateFilter: function (node: any, i: any) {
      return true;
    },
    ready: undefined,
    stop: undefined,
    transform: function (node: any, position: any) {
      return position;
    }
  },
  circle: {
    name: "circle",

    fit: true,
    padding: 30,
    boundingBox: undefined,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
    spacingFactor: undefined,
    radius: undefined,
    startAngle: (3 / 2) * Math.PI,
    sweep: undefined,
    clockwise: true,
    sort: undefined,
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in",
    animateFilter: function (node: any, i: any) {
      return true;
    },
    ready: undefined,
    stop: undefined,
    transform: function (node: any, position: any) {
      return position;
    }
  },
  cola: {
    name: "cola",

    animate: true,
    refresh: 1,
    maxSimulationTime: 4000,
    ungrabifyWhileSimulating: true,
    fit: true,
    padding: 30,
    randomize: false,
    nodeSpacing: function (node: any) {
      return 10;
    },
    edgeLengthVal: 45,
    boundingBox: {
      x1: 0,
      y1: 0,
      x2: 500,
      y2: 500
    },
    avoidOverlap: true // 노드가 겹치지 않게 합니다.
  },
  concentric: {
    name: "concentric",

    fit: true,
    padding: 30,
    startAngle: (3 / 2) * Math.PI,
    sweep: undefined,
    clockwise: true,
    equidistant: false,
    minNodeSpacing: 10,
    boundingBox: undefined,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
    height: undefined,
    width: undefined,
    spacingFactor: undefined,
    concentric: function (node: any) {
      return node.degree();
    },
    levelWidth: function (nodes: any) {
      return nodes.maxDegree() / 4;
    },
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in",
    animateFilter: function (node: any, i: any) {
      return true;
    },
    ready: undefined,
    stop: undefined,
    transform: function (node: any, position: any) {
      return position;
    }
  },
  random: {
    name: "random",

    fit: true,
    padding: 30,
    boundingBox: undefined,
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in",
    animateFilter: function (node: any, i: any) {
      return true;
    },
    ready: undefined,
    stop: undefined,
    transform: function (node: any, position: any) {
      return position;
    }
  },
  breadthfirst: {
    name: "breadthfirst",

    fit: true,
    directed: false,
    padding: 30,
    circle: false,
    grid: false,
    spacingFactor: 1.75,
    boundingBox: undefined,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
    roots: undefined,
    depthSort: undefined,
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in",
    animateFilter: function (node: any, i: any) {
      return true;
    },
    ready: undefined,
    stop: undefined,
    transform: function (node: any, position: any) {
      return position;
    }
  },
  cose: {
    name: "cose",

    ready: function () {},
    stop: function () {},

    animate: true,
    animationEasing: "ease-in",
    animationDuration: 500,
    animateFilter: function (nod: any, i: any) {
      return true;
    },
    animationThreshold: 250,
    refresh: 20,
    fit: true,
    padding: 30,
    boundingBox: undefined,
    nodeDimensionsIncludeLabels: false,
    randomize: false,
    componentSpacing: 40,
    nodeRepulsion: function (node: any) {
      return 2048;
    },
    nodeOverlap: 4,
    idealEdgeLength: function (edge: any) {
      return 32;
    },
    edgeElasticity: function (edge: any) {
      return 32;
    },
    nestingFactor: 1.2,
    gravity: 1,
    numIter: 1000,
    initialTemp: 1000,
    coolingFactor: 0.99,

    minTemp: 1.0
  }
};

const changeLayout = () => {
  if (options[selectedLayout.value]) {
    emit("setGraphLayout", options[selectedLayout.value]);
  } else {
    console.error("fail");
  }
};

const capitalizeFirstLetter = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};
</script>

<style lang="scss"></style>
