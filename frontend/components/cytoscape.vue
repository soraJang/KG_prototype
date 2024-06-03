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
import { useCytoscapeStore } from "@store/useCytoscapeStore";
import CONSTANTS from "@cons/constants";
import Filter from "@comp/units/filter.vue";
import SelectLayout from "@comp/units/selectLayout.vue";
import useCytoscapeDragOpt from "../composables/cytoscape/dragOpt";

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

const hideNodeList = ref([]);
const parentColorObj = ref({});

const mmContainer = ref(null);
const filters = ref<Filter[]>([]);
let highlightedNodeId = ref([]);
let cy: any = null;

onMounted(() => {
  const cytoscape = nuxtApp.$cytoscape;
  const container = mmContainer.value;

  cy = cytoscape({
    container: container,
    elements: props.nodeData,
    style: props.styleJson,
    zoom: 1,
    layout: cytoscapeStore.graphLayouts[props.defaultLayout]
  });

  cy.zoom({
    // level: 2.0,
    renderedPosition: {
      x: container.offsetWidth / 2,
      y: container.offsetHeight / 2
    }
  });
  const cdnd = cy.compoundDragAndDrop(useCytoscapeDragOpt().option.value);

  // 부모 노드 tag 추가
  cy.nodeHtmlLabel([
    {
      query: ":parent",
      valign: "top",
      halign: "center",
      valignBox: "top",
      halignBox: "center",
      tpl: (data) => {
        const el = cy.getElementById(data.id);

        return `<p class="htmlTag ${
          hideNodeList.value.includes(data.id) ? "hide" : ""
        }" id="htmlTag_${data.id}">${
          el.isParent()
            ? `${el.data().label} (${el.children().length})`
            : el.data().label
        }</p>`;
      }
    }
  ]);

  cy.elements().forEach((element: any) => {
    let colorCode: string = getRandomColor();
    if (element.isChild()) {
      // 자식노드는 별도 처리한다.
      return;
    }
    if (element.isParent()) {
      // 자식 노드 색상을 여기서 설정해둔다.
      element.data("childColor", getRandomColor());
    }

    if (element.isNode()) {
      // 자식 노드 일 경우, 색상을 통일시켜줘야함.
      element.style("background-color", colorCode);
      // 자식노드는 filter 에 표시하지 않음.
      if (!element.isChild()) {
        filters.value.push({
          id: element.id(),
          label: element.data().label,
          color: colorCode,
          isUnChecked: false
        });
      }
    }
  });

  cy.elements().forEach((e) => {
    // 자식노드일때, 부모노드에 설정해두었던 색상코드를 일괄적용한다.
    if (e.isChild()) {
      e.style("background-color", e.parent().data("childColor"));
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

      // loop 를 도는 노드가 자식노드이고,
      // 해당 노드의 부모 노드가 선택한 노드라면,
      // loop를 도는 노드도 선택한걸로 해줘야함.
      if (
        element.isChild() &&
        element.parent().data().id === evtTarget.data().id
      ) {
        element.removeClass(CONSTANTS.NOT_SELECTED);
        element.addClass(CONSTANTS.HIGHLIGHT);
      }
    });

    if (evtTarget.isChild()) {
      // 자식노드면 부모 노드도 선택한걸로 처리해줘야함.
      highlightedNodeId.value.push(evtTarget.parent().data().id);
      evtTarget.parent().removeClass(CONSTANTS.NOT_SELECTED);
      evtTarget.parent().addClass(CONSTANTS.HIGHLIGHT);
    }
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
  const htmlTagEl = document.querySelector("p#htmlTag_" + id + ".htmlTag");
  if (htmlTagEl !== undefined) {
    if (isUnChecked) {
      hideNodeList.value.push(id);
    } else {
      hideNodeList.value = hideNodeList.value.filter((e) => e !== id);
    }
  }

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

p.htmlTag.hide {
  display: none;
}
</style>
