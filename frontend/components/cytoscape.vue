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

    <div
      id="cy"
      ref="mmContainer"
      style="width: calc(100% - 400px); height: 800px; border: 1px solid #ddd"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from "vue";
import { useCytoscapeStore } from "@store/useCytoscapeStore";
import CONSTANTS from "@cons/constants";
import Filter from "@comp/units/filter.vue";
import SelectLayout from "@comp/units/selectLayout.vue";
import useCytoscapeDragOpt from "@composables/cytoscape/dragOpt";

interface Filter {
  id: string;
  label: string;
  color: string;
  isUnChecked: boolean;
}

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

const nuxtApp = useNuxtApp();
const cytoscapeStore = useCytoscapeStore();
const { option, getTarget, createNewEdge, getChild, getSibling, getParent } =
  useCytoscapeDragOpt();
const hideNodeList = ref([]);
const filterList = ref([]);
const mmContainer = ref(null);
const filters = ref<Filter[]>([]);
let highlightedNodeId = ref([]);
let cy: any = null;
let refinedLayoutData = ref({});

const childrenBackup = ref({});

onMounted(() => {
  const cytoscape = nuxtApp.$cytoscape;
  const container = mmContainer.value;

  cy = cytoscape({
    container: container,
    elements: props.nodeData,
    style: props.styleJson,
    zoom: 1,
    pan: {
      x: 0,
      y: 0
    }
  });

  // TODO : parent-child 관계가 없으면 layout이 정상적으로 그려짐.
  // parent 밑에 child 가 한개라도 있으면 layout 이 정상적으로 안그려짐.
  // cy.elements().children((c) => {
  //   if (!c.removed()) {
  //     const pId = c.parent().data().id;
  //     const sib = c.parent().children();
  //
  //     childrenBackup.value[pId] = sib;
  //     sib.forEach((r, rI) => {
  //         console.log("r: " + r.data().id);
  //         r.remove();
  //       }
  //     });
  //   }
  // });

  // layout 초기화
  const initLayout = cytoscapeStore.graphLayouts[props.defaultLayout];
  // isChild 인 node를 제외하고 layout이 적용되도록 새로 담기
  const nodesToLayout = cy.nodes().filter((node: any) => !node.isChild());
  const edgesToLayout = cy.edges();
  refinedLayoutData = nodesToLayout.union(edgesToLayout);

  const layoutOptions = {
    ...initLayout,
    eles: refinedLayoutData
  };
  cy.layout(layoutOptions).run();

  const cdnd = cy.compoundDragAndDrop(option.value);

  // 여기서 node 에 대한 automove 를 설정하고 싶으나,
  // 설정이 잘못되었는지 무한루프가 돌아버려서 저 아래서 각각의 node 에 추가해주기로 한다.
  // 사용은 아래처럼 하고, defaultOption 등을 다른 파일로 관리해도 됨.
  // let rule = cy.automove({});

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
      // 노드일때, viewport 밖으로 이동할수 없게 처리해준다.
      cy.automove({
        nodesMatching: cy.$(`#${el.data().id}`),
        reposition: "viewport"
      });

      filterList.value.push(el);
      el.data("colorCode", colorCode);

      if (el.isChild()) {
        // do something
        const parentData = el.parent().data();
        el.data(CONSTANTS.PRNT_CTGRY_ID, parentData.id);
        el.data(CONSTANTS.PRNT_CTGRY_NM, parentData.label);
        el.style("display", "none");
      } else if (el.isParent()) {
        // 자식 노드 색상을 여기서 설정해둔다. (부모 노드와 색상 동일하게)
        // TODO : 혹은 색상 채도를 좀 낮춰서 표시 (코드가 복잡해서 보류)
        el.data("childColor", colorCode);
        el.data().label = `${el.data().label}(${el.children().length})`;
      }
    } else {
      // edge 일때
    }
  });

  setFilters();

  // 부모 노드의 경우 위치를 가질수 없음. 자식노드를 기준으로 부모노드의 위치가 결정됨
  // 자식노드를 position 을 통일해서 해당 위치가 부모 노드인것처럼 처리해야함.
  // let doneParentList = [];
  // cy.elements()
  //   .children()
  //   .forEach((c) => {
  //     let parentId = c.data(CONSTANTS.PRNT_CTGRY_ID);
  //
  //     if (!doneParentList.includes(parentId)) {
  //       const siblings = getSibling(cy, c);
  //       siblings.forEach((s) => {
  //         s.position(c.position());
  //       });
  //       doneParentList.push(parentId);
  //     }
  //   });

  cy.elements().forEach((element: any) => {
    // 자식노드일때, 부모노드에 설정해두었던 색상코드를 일괄적용한다.
    if (element.isChild()) {
      element.style("background-color", element.parent().data("childColor"));
    }
  });

  cy.on("tap", (event: any) => {
    let evtTarget = event.target;

    highlightedNodeId.value = [];

    if (evtTarget === cy) {
      cy.elements().forEach((element: any) => {
        if (element.isNode() || element.isEdge()) {
          element.removeClass(CONSTANTS.HIGHLIGHT);
          element.removeClass(CONSTANTS.NOT_SELECTED);
        }

        // isParent인 경우 라벨 위치 센터로 + child 숨기기
        if (element.isParent()) {
          const children = element.children();
          children.style("display", "none");
          element.style("text-valign", "center");
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

    if (evtTarget.isParent()) {
      // isParent인 경우 라벨 위치 위로 + child 보이기
      const children = evtTarget.children();
      setChildPosition(evtTarget);

      evtTarget.style("text-valign", "top");
      children.style("display", "element");
    }

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

  let x = 0;
  let y = 0;
  cy.on("dragpan", () => {
    if (isGraphOutOfView()) {
      cy.viewport({ pan: { x: x, y: y } });
    } else {
      const pan = cy.pan();
      x = pan.x;
      y = pan.y;
    }
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

      layoutRun(initLayout);
    }
  });
});

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

const setChildPosition = (pEl: any) => {
  if (pEl.isParent()) {
    const pPos = pEl.position();
    const childCnt = pEl.children().length;
    const w = 50;
    const h = 50;

    const boxSize = getSquareBoxSize(childCnt);
    let heightSize = boxSize;

    /**
     * box 의 height Line Cnt 를 구한다.
     * box 는 child 갯수 기준으로 정사각형에 그린다고 생각하고 구함.
     * child 갯수가 4개면 정사각형 2*2 에 그려야함.
     * child 갯수가 8개면 정사각형 3*3에 그려야함.
     *
     * 단, child 갯수가 5개나 6개일 경우, 3*3 에 그려야 하지만
     * 맨 마지막 라인은 그릴게 없다.
     * 그러면 실제로 사용하는? height 와 계산된 height가 달라지기 때문에 여기서 계산을 제대로 해준다.
     * box size 는 3이지만, height 는 2가 되는 셈.
     */
    if (boxSize * boxSize - boxSize >= childCnt) {
      heightSize--;
    }
    const wSize = w * boxSize;
    const hSize = h * heightSize;

    const X1 = pPos.x - wSize / 2;
    const Y1 = pPos.y + hSize / 2;

    let childX = 0;
    let childY = 0;

    let cnt = -1;
    for (let hI = 0, hSize = boxSize; hI < hSize; hI++) {
      for (let wI = 0, wSize = boxSize; wI < wSize; wI++) {
        cnt++;
        if (cnt >= childCnt) {
          break;
        }
        childX = X1 + wI * w + w / 2;
        childY = Y1 - (h / 2 + h * hI);
        const c = pEl.children()[cnt];
        c.position({ x: childX, y: childY });
      }
    }
  }
};

// 정사각형 갯수를 구함.
const getSquareBoxSize = (n) => {
  return Math.ceil(Math.sqrt(n));
};

const isGraphOutOfView = () => {
  const rbb = cy.elements().renderedBoundingbox();

  return (
    rbb.x1 < 0 || rbb.y1 < 0 || rbb.x2 > cy.width() || rbb.y2 > cy.height()
  );
};

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
    c.style("display", "none");
  });
  el.style("text-valign", "center");
};

const setGraphLayout = (layout: object) => {
  const layoutOptions = {
    ...layout,
    eles: refinedLayoutData
  };
  layoutRun(layoutOptions);
};
const layoutRun = (layoutOptions) => {
  if (cy) {
    cy.layout(layoutOptions).run();
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

.htmlTag {
  font-size: 10px;
  color: #333;
  cursor: default;

  &:hover {
    font-size: 12px;
    text-wrap: wrap;
  }
}

p.htmlTag.hide {
  display: none;
}
</style>
