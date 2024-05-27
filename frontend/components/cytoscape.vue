<template>
  <Top v-if="useTop" class="part top"></Top>
  <Filter v-if="useFilter" class="part filter" :filters="filters"></Filter>
  <MouseOption class="part">마우스 우클릭</MouseOption>
  <ControlBtn v-if="useControlBtn" class="part setting"
    >하단 아래 설정 아이콘</ControlBtn
  >

  <div
    ref="mmContainer"
    style="width: 1400px; height: 1000px; border: black; border-inline-width: 3"
  ></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
const nuxtApp = useNuxtApp();

import Filter from "./units/filter.vue";
import Top from "./units/top.vue";
import MouseOption from "./units/mouse-option.vue";
import ControlBtn from "./units/control-btn.vue";

const mmContainer = ref(null);

const props = defineProps({
  nodeData: {
    type: Object,
    required: true
  },
  styleJson: {
    type: Array,
    required: false,
    defaults: () => {
      return [];
    }
  },
  useFilter: {
    type: Boolean,
    default: true
  },
  useTop: {
    type: Boolean,
    default: true
  },
  useControlBtn: {
    type: Boolean,
    default: true
  }
});

onMounted(() => {
  const cytoscape = nuxtApp.$cytoscape;
  let cy = null;

  cy = cytoscape({
    container: mmContainer.value,
    elements: props.nodeData,
    style: props.styleJson,
    zoom: 1,
    layout: {
      name: "preset"
    }
  });
});
</script>

<style lang="scss" scoped>
.part {
  border: 1px solid red;
}
.top {
}
.filter {
}
.setting {
}
</style>
