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
import useCytoscapeDragOpt from "@composables/cytoscape/dragOpt";

const { option, getTarget, createNewEdge, getChild, getSibling, getParent } =
  useCytoscapeDragOpt();

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
const filterList = ref([]);
const layoutObj = ref({});

const mmContainer = ref(null);
const filters = ref<Filter[]>([]);
let highlightedNodeId = ref([]);
let cy: any = null;

const setFilters = () => {
  filterList.value.forEach((el) => {
    if (!el.isChild()) {
      filters.value.push({
        id: el.id(),
        label: el.data().label,
        color: el.data("colorCode"),
        isUnChecked: false
      });
    }
  });
};

onMounted(() => {
  const cytoscape = nuxtApp.$cytoscape;
  const container = mmContainer.value;
  layoutObj.value = cytoscapeStore.graphLayouts[props.defaultLayout];

  cy = cytoscape({
    container: container,
    elements: props.nodeData,
    style: props.styleJson,
    layout: layoutObj.value,
    zoom: 1,
    pan: {
      x: 0,
      y: 0
    }
  });
  // cy.viewport({
  //   zoom: 0.1
  // });
  const cdnd = cy.compoundDragAndDrop(option.value);

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

  cy.elements().forEach((el: any) => {
    let colorCode: string = getRandomColor();

    /**
     * 노드 돌면서 해야하는 일
     * - 노드일때
     *    - child 일때
     *        - pass
     *    - parent 일때
     *        - filterList 에 넣기
     * - 엣지일때
     *    -- 없음
     */

    el.style("background-color", colorCode);

    // Node 일때
    if (el.isNode()) {
      filterList.value.push(el);
      el.data("colorCode", colorCode);

      if (el.isChild()) {
        // do something
        const parentData = el.parent().data();
        el.data(CONSTANTS.PRNT_CTGRY_ID, parentData.id);
        el.data(CONSTANTS.PRNT_CTGRY_NM, parentData.label);
      } else if (el.isParent()) {
        // 자식 노드 색상을 여기서 설정해둔다. (부모 노드와 색상 동일하게)
        // TODO : 혹은 색상 채도를 좀 낮춰서 표시 (코드가 복잡해서 보류)
        el.data("childColor", colorCode);
      }
    } else {
      // edge 일때
    }
  });
  setFilters();

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
    let parentId = evtTarget.data(CONSTANTS.PRNT_CTGRY_ID);

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

    if (parentId !== undefined) {
      // 자식노드면 부모 노드도 선택한걸로 처리해줘야함.
      const parentNode = getParent(cy, evtTarget);
      highlightedNodeId.value.push(parentId);
      parentNode.removeClass(CONSTANTS.NOT_SELECTED);
      parentNode.addClass(CONSTANTS.HIGHLIGHT);
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

  /**
   * canvas? 를 drag 할때, 동작하는 event 인데
   * 맨 처음 canvas 를 그릴때 중심 기준으로 위치를 잡음
   * -> 노드 위치가 바뀐다고 해서, canvas 의 중심 위치가 바뀌지 않음.
   * 그러니까 정확하게 하려면? 노드 위치가 바뀔때마다 중심 위치를 계산해서.. 어쩌고..
   */
  cy.on("dragpan", (e, a, b, c) => {
    const el = e.target;

    // el.nodes().forEach((n) => {
    //   // const { x1, x2, y1, y2 } = n.renderedBoundingBox();
    // });

    // // console.log(`${x} | ${y}`);
    // // cy.viewport({ pan: { x: x < 0 ? 0 : x, y: y < 0 ? 0 : y } });
  });

  // dbl click 간격?
  cy.dblclick(100);
  cy.on("dblclick", (evt: any) => {
    const el = evt.target;
    /**
     * 상위 노드 dbl click 했을때, 상위 노드를 없애고 하위노드를 전개한다.
     * 1. 하위노드들 edge 생성
     * 2. 하위노드들 부모 삭제
     * 3. 상위노드 삭제
     * 4. filter 처리 추가
     *  4-1. filter 를 parent 기준이 아니라, prnt_ctgry_id 를 기준으로 해야함.
     *  parent 는 dbl click 으로 끊기기 때문에, 맨 처음에 노드를 한바퀴 돌면서 부모 정보를 노드 data에 저장해둠
     *  그거를 가지고 처리 필요함.
     */

    if (el.isParent()) {
      el.children().style("background-color", el.style("background-color"));

      // 상위노드의 edge 정보를 자식에도 추가
      cy.add(createNewEdge(el.children(), getTarget(el)));
      // 상위-하위 연결을 끊음 (부모정보 삭제)
      el.children().move({ parent: null });
      // 상위 노드는 더이상 사용하지 않기때문에 숨김처리 (삭제시에 상위노드가 '노드'로 남는 현상 등 오류가 있어 숨김처리 함)
      el.hide();

      layoutRun();
    }
  });
});

const getColorCode = () => {
  return Math.floor(Math.random() * 127 + 115).toString(16);
};
const getRandomColor = () => {
  return `#${getColorCode()}${getColorCode()}${getColorCode()}`;
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

  const el = cy.getElementById(id);
  isUnChecked ? el.hide() : el.show();

  // 선택한 노드를 부모로 가지고 있는 노드도 처리해준다.
  const children = getChild(cy, el);
  children.forEach((c) => {
    isUnChecked ? c.hide() : c.show();
  });
};

const setGraphLayout = (layout: object) => {
  layoutObj.value = layout;
  layoutRun();
};
const layoutRun = () => {
  if (cy) {
    cy.layout(layoutObj.value).run();
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
.part,
#cy {
  border: 1px solid red;
}
#cy {
}

p.htmlTag.hide {
  display: none;
}
</style>
