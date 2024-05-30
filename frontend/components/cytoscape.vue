<template>
  <Top v-if="useTop" class="part top"></Top>
  <Filter
    v-if="useFilter"
    :filters="filters"
    :highlighted-node-id="highlightedNodeId"
    @set-node-view="setNodeView"
  ></Filter>
  <MouseOption class="part">마우스 우클릭</MouseOption>
  <ControlBtn v-if="useControlBtn" class="part setting"
    >하단 아래 설정 아이콘
  </ControlBtn>
  <div id="cy" ref="mmContainer" style="width: 1400px; height: 1000px"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from "vue";

const nuxtApp = useNuxtApp();

import Filter from "./units/filter.vue";
import Top from "./units/top.vue";
import MouseOption from "./units/mouse-option.vue";
import ControlBtn from "./units/control-btn.vue";

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

interface Filter {
  id: string;
  label: string;
  color: string;
  isUnChecked: boolean;
}

const mmContainer = ref(null);
const filters = ref<Filter[]>([]);
let highlightedNodeId = ref([]);
let cy: any = null;

onMounted(() => {
  const cytoscape = nuxtApp.$cytoscape;

  cy = cytoscape({
    container: mmContainer.value,
    elements: props.nodeData,
    style: props.styleJson,
    zoom: 1,
    layout: {
      name: "preset"
    }
  });

  cy.elements().forEach((element: any) => {
    let colorCode: string = getRandomColor();
    if (element.isNode()) {
      element.style("background-color", colorCode);
      filters.value.push({
        id: element.id(),
        label: element.data().label,
        color: colorCode,
        isUnChecked: false
      });
    }
  });

  cy.on("tap", (event: any) => {
    let evtTarget = event.target;

    highlightedNodeId.value = [];

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

  cy.on("tap", "node", (event: any) => {
    let evtTarget = event.target;

    highlightedNodeId.value.push(evtTarget.id());

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

    highlightedNodeId.value.push(startNode.id(), endNode.id());

    cy.elements().removeClass("notSelected");
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

let getRandomColor = () => {
  let color_r = Math.floor(Math.random() * 127 + 115).toString(16);
  let color_g = Math.floor(Math.random() * 127 + 115).toString(16);
  let color_b = Math.floor(Math.random() * 127 + 115).toString(16);
  return `#${color_r + color_g + color_b}`;
};

const setNodeView = (id: string, isUnChecked: boolean) => {
  cy.elements().forEach((element: any) => {
    if (element.isNode()) {
      if (element.id() === id) {
        isUnChecked ? element.hide() : element.show();
      }
    }
  });
};
</script>

<style lang="scss">
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}

.part {
  border: 1px solid red;
}
</style>
