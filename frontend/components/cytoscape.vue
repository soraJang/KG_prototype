<template>
  <Top v-if="useTop" class="part top"></Top>
  <Filter v-if="useFilter" :filters="filters"></Filter>
  <MouseOption class="part">마우스 우클릭</MouseOption>
  <ControlBtn v-if="useControlBtn" class="part setting"
    >하단 아래 설정 아이콘
  </ControlBtn>
  <div id="cy" ref="mmContainer" style="width: 1400px; height: 1000px"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const nuxtApp = useNuxtApp();

import Filter from "./units/filter.vue";
import Top from "./units/top.vue";
import MouseOption from "./units/mouse-option.vue";
import ControlBtn from "./units/control-btn.vue";

const mmContainer = ref(null);
const filters = ref([]);

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
  let cy: any = null;

  cy = cytoscape({
    container: mmContainer.value,
    elements: props.nodeData,
    style: props.styleJson,
    zoom: 1,
    layout: {
      name: "preset"
    }
  });

  cy.elements().forEach((node: any) => {
    let colorCode: string = getRandomColor();
    if (node.isNode()) {
      node.style("background-color", colorCode);
      filters.value.push({
        id: node.id(),
        label: node.data().label,
        color: colorCode
      });
    }
  });
  console.log("filters", filters.value);

  cy.on("tap", "node", (event: any) => {
    let evtTarget = event.target;

    cy.elements().removeClass("notSelected");
    evtTarget.addClass("highlight");

    cy.elements().forEach((element: any) => {
      if (element.isNode() && element !== evtTarget) {
        element.addClass("notSelected");
      } else if (element.isEdge()) {
        element.addClass("notSelected");
      }
    });
  });

  cy.on("tap", "edge", (event: any) => {
    let evtTarget = event.target;
    let startNode = evtTarget.source();
    let endNode = evtTarget.target();

    evtTarget.addClass("highlight");
    startNode.addClass("highlight");
    endNode.addClass("highlight");

    cy.elements().forEach((element: any) => {
      if (element.isNode() && element !== startNode && element !== endNode) {
        element.addClass("notSelected");
      } else if (element.isEdge() && element !== evtTarget) {
        element.addClass("notSelected");
      }
    });
  });

  cy.on("tap", (event: any) => {
    let evtTarget = event.target;

    if (evtTarget === cy) {
      cy.elements().forEach((element: any) => {
        if (element.isNode()) {
          element.removeClass("highlight");
          element.removeClass("notSelected");
        } else if (element.isEdge()) {
          element.removeClass("highlight");
          element.removeClass("notSelected");
        }
      });
    }
  });

  cy.on("mouseover", "node", (event: any) => {
    let evtTarget = event.target;
    evtTarget.addClass("mouseHover");
  });

  cy.on("mouseout", "node", (event: any) => {
    let evtTarget = event.target;
    evtTarget.removeClass("mouseHover");
  });

  cy.on("mouseover", "edge", (event: any) => {
    let evtTarget = event.target;
    evtTarget.addClass("mouseHover");
  });

  cy.on("mouseout", "edge", (event: any) => {
    let evtTarget = event.target;
    evtTarget.removeClass("mouseHover");
  });
});

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
</script>

<style lang="scss" scoped>
.part {
  border: 1px solid red;
}
</style>
