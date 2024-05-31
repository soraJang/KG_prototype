<template>
  <div>
    <SelectLayout
      v-if="useTop"
      :default-layout="defaultLayout"
      @set-graph-layout="setGraphLayout"
    ></SelectLayout>
    <Filter
      v-if="useFilter"
      :filters="filters"
      :highlighted-node-id="highlightedNodeId"
      @set-node-view="setNodeView"
    ></Filter>
    <div id="cy" ref="mmContainer" style="width: 1400px; height: 1000px"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from "vue";
import { useCytoscapeStore } from "~/store/useCytoscapeStore";
import CONSTANTS from "~/constants/constants";
import Filter from "~/components/units/filter.vue";
import SelectLayout from "~/components/units/selectLayout.vue";

const nuxtApp = useNuxtApp();

const cytoscapeStore = useCytoscapeStore();

const props = defineProps({
  defaultLayout: {
    type: String,
    required: true
  },
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
    layout: cytoscapeStore.graphLayouts[props.defaultLayout]
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
          element.removeClass(CONSTANTS.HIGHLIGHT);
          element.removeClass(CONSTANTS.NOT_SELECTED);
        } else if (element.isEdge()) {
          element.removeClass(CONSTANTS.HIGHLIGHT);
          element.removeClass(CONSTANTS.NOT_SELECTED);
        }
      });
    }
  });

  cy.on("tap", "node", (event: any) => {
    let evtTarget = event.target;

    highlightedNodeId.value.push(evtTarget.id());

    cy.elements().removeClass(CONSTANTS.NOT_SELECTED);
    evtTarget.addClass(CONSTANTS.HIGHLIGHT);

    cy.elements().forEach((element: any) => {
      if (element.isNode() && element !== evtTarget) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      } else if (element.isEdge()) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      }
    });
  });

  cy.on("tap", "edge", (event: any) => {
    let evtTarget = event.target;
    let startNode = evtTarget.source();
    let endNode = evtTarget.target();

    highlightedNodeId.value.push(startNode.id(), endNode.id());

    cy.elements().removeClass(CONSTANTS.NOT_SELECTED);
    evtTarget.addClass(CONSTANTS.HIGHLIGHT);
    startNode.addClass(CONSTANTS.HIGHLIGHT);
    endNode.addClass(CONSTANTS.HIGHLIGHT);

    cy.elements().forEach((element: any) => {
      if (element.isNode() && element !== startNode && element !== endNode) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      } else if (element.isEdge() && element !== evtTarget) {
        element.addClass(CONSTANTS.NOT_SELECTED);
      }
    });
  });

  cy.on("mouseover", "node", (event: any) => {
    let evtTarget = event.target;
    evtTarget.addClass(CONSTANTS.MOUSE_HOVER);
  });

  cy.on("mouseout", "node", (event: any) => {
    let evtTarget = event.target;
    evtTarget.removeClass(CONSTANTS.MOUSE_HOVER);
  });

  cy.on("mouseover", "edge", (event: any) => {
    let evtTarget = event.target;
    evtTarget.addClass(CONSTANTS.MOUSE_HOVER);
  });

  cy.on("mouseout", "edge", (event: any) => {
    let evtTarget = event.target;
    evtTarget.removeClass(CONSTANTS.MOUSE_HOVER);
  });
});

const getRandomColor = () => {
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

const setGraphLayout = (layout: object) => {
  if (cy) {
    cy.layout(layout).run();
  } else {
    console.error("fail");
  }
};
</script>

<style lang="scss">
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  outline: none;
}
.part {
  border: 1px solid red;
}
</style>
