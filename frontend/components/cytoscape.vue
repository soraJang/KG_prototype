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
    <div style="position: relative; width: calc(100% - 350px); height: 1000px">
      <div
        id="cy"
        ref="mmContainer"
        style="width: 100%; height: 100%; border: 1px solid #ddd"
      ></div>
      <div
        class="tooltip"
        v-if="tooltipVisible"
        :style="tooltipStyles"
        ref="tooltip"
      >
        {{ tooltipContent }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, watch } from "vue";
import { useFloating } from "@floating-ui/vue";
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
const {
  option,
  getTarget,
  createNewEdge,
  getChild,
  getSibling,
  getParent,
  isPrnt
} = useCytoscapeDragOpt();
const hideNodeList = ref([]);
const filterList = ref([]);
const mmContainer = ref(null);
const filters = ref<Filter[]>([]);
let highlightedNodeId = ref([]);
let cy: any = null;
let refinedLayoutData = ref({});
const reference = ref(null);
const floating = ref(null);
const tooltipVisible = ref(false);
const tooltipContent = ref("");
const tooltipStyles = ref({});

const useDragpanOpt = ref(true);

useFloating(reference, floating, {});

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
  cy.viewport({ zoom: 0.5, pan: { x: 100, y: 100 } });

  cyDataReset();

  // layout 초기화
  const initLayout = cytoscapeStore.graphLayouts[props.defaultLayout];
  layoutRun(initLayout);

  cy.compoundDragAndDrop(option.value);

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
      } else if (isPrnt(el)) {
        // 자식 노드 색상을 여기서 설정해둔다. (부모 노드와 색상 동일하게)
        // TODO : 혹은 색상 채도를 좀 낮춰서 표시 (코드가 복잡해서 보류)
        el.data("childColor", colorCode);
        el.data().label = `${el.data().label}(${
          el.isParent() ? el.children().length : el.data(CONSTANTS.CHILD_CNT)
        })`;
      }
    } else {
      // edge 일때
    }
  });

  setFilters();

  cy.on("tap", (event: any) => {
    let evtTarget = event.target;

    highlightedNodeId.value = [];

    if (evtTarget === cy) {
      tapReset();
    }
  });

  cy.on("tap", "node", (event: any) => {
    let evtTarget = event.target;
    let parentId = evtTarget.data(CONSTANTS.PRNT_CTGRY_ID);

    highlightedNodeId.value.push(evtTarget.id());

    cy.elements().removeClass(CONSTANTS.NOT_SELECTED);
    evtTarget.addClass(CONSTANTS.HIGHLIGHT);

    if (isPrnt(evtTarget)) {
      if (!evtTarget.isParent() && evtTarget.data(CONSTANTS.IS_PARENT)) {
        const oldPosition = evtTarget.position();

        // 만약 자식 노드가 없는데, parent tag 가 붙어있는 경우, 자식 노드를 추가해주어야 한다.
        const siblings = childrenBackup.value[evtTarget.data().id];
        cy.add(siblings);
        evtTarget.children().position(oldPosition);
        evtTarget
          .children()
          .style("background-color", evtTarget.data("childColor"));
        evtTarget.data({
          [CONSTANTS.IS_PARENT]: false,
          [CONSTANTS.CHILD_CNT]: 0
        });
      }
      // isParent인 경우 라벨 위치 위로 + child 보이기
      setChildPosition(evtTarget, 0, 0);

      evtTarget.style("text-valign", "top");
      evtTarget.style("padding", 10);
      evtTarget.children().style("display", "element");
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

    const pos = evtTarget.renderedPosition();
    const targetBoundingWidth = evtTarget.boundingBox().w;

    tooltipContent.value = evtTarget.data("label");
    tooltipVisible.value = true;
    tooltipStyles.value = {
      position: "absolute",
      top: `${pos.y - 15}px`,
      left: `${pos.x + targetBoundingWidth / 2 + 2}px`
    };
  });

  cy.on("mouseout", "node", (event: any) => {
    let evtTarget = event.target;
    evtTarget.removeClass(CONSTANTS.MOUSE_HOVER);

    tooltipVisible.value = false;
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
    if (useDragpanOpt.value) {
      if (isGraphOutOfView()) {
        cy.viewport({ pan: { x: x, y: y } });
      } else {
        const pan = cy.pan();
        x = pan.x;
        y = pan.y;
      }
    } else {
      if (!isGraphOutOfView()) {
        useDragpanOpt.value = true;
      }
    }
  });
  cy.on("zoom", () => {
    if (isGraphOutOfView()) {
      // zoom 을 해서, graph 가 영역 밖으로 벗어난 경우, dragpan 옵션을 꺼준다. (사용하지 않음)
      useDragpanOpt.value = false;
    } else {
      useDragpanOpt.value = true;
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

    if (isPrnt(el)) {
      el.children().style("background-color", el.style("background-color"));

      // 상위노드의 edge 정보를 자식에도 추가
      cy.add(createNewEdge(el.children(), getTarget(el)));

      // child 노드들의 위치 특정
      setDblClickPosition(el, el.children());

      // 상위-하위 연결을 끊음 (부모정보 삭제)
      el.children().move({ parent: null });
      // 상위 노드는 더이상 사용하지 않기때문에 숨김처리 (삭제시에 상위노드가 '노드'로 남는 현상 등 오류가 있어 숨김처리 함)
      el.hide();
    }
  });
});

const getElPositionToNum = (el) => {
  const { x, y } = el.renderedPosition();

  const W_point = cy.width() / 2;
  const H_point = cy.height() / 2;

  if (y < H_point) {
    return x < W_point ? 1 : 2;
  } else {
    return x < W_point ? 4 : 3;
  }
};
const setDblClickPosition = (el: any, children: any[]) => {
  // viewport 기준으로 el 의 위치가 1,2,3,4 분위 어디에 있는지 구한다. 그쪽으로 노드를 전개한다.
  const elP = getElPositionToNum(el);

  let w,
    h = 0;

  const addNum = 150;
  switch (elP) {
    case 1:
      w = -addNum;
      h = addNum;
      break;
    case 2:
      w = addNum;
      h = addNum;
      break;
    case 3:
      w = addNum;
      h = -addNum;
      break;
    case 4:
      w = -addNum;
      h = -addNum;
      break;
  }

  setChildPosition(el, w, h);
};

const setFilters = () => {
  filterList.value.forEach((el) => {
    if (!el.isChild() || isPrnt(el)) {
      filters.value.push({
        id: el.id(),
        label: el.data().label,
        color: el.data("colorCode"),
        isUnChecked: false
      });
    }
  });
};

const tapReset = () => {
  cy.elements().forEach((element: any) => {
    if (element.isNode() || element.isEdge()) {
      element.removeClass(CONSTANTS.HIGHLIGHT);
      element.removeClass(CONSTANTS.NOT_SELECTED);
    }

    // isParent인 경우 라벨 위치 센터로 + child 숨기기
    if (isPrnt(element)) {
      const children = element.children();
      children.style("display", "none");
      element.style("text-valign", "center");
      element.style("padding", 0);
    }
  });
};

const cyDataReset = () => {
  /**
   * parent-child 관계가 없으면 layout이 정상적으로 그려짐.
   * 처음에 parent - child 관계를 다 끊고 시작.
   * parent 는 따로 저장해 두었다가, 노드를 선택할때, child 를 추가하여 화면에 그려준다.
   */
  cy.elements().children((c) => {
    if (!c.removed()) {
      const pId = c.parent().data().id;
      const sib = c.parent().children();

      childrenBackup.value[pId] = sib;

      const parentEl = cy.$(`#${pId}`);
      parentEl.data({
        [CONSTANTS.IS_PARENT]: true,
        [CONSTANTS.CHILD_CNT]: sib.length
      });
      parentEl.addClass("parentNode");
      sib.forEach((r, rI) => {
        r.remove();
      });
    }
  });
};
const setChildPosition = (pEl: any, addW: number, addH: number) => {
  if (isPrnt(pEl)) {
    const pPos = pEl.position();
    const childCnt = pEl.children().length;
    const w = addW != 0 ? 100 : 50;
    const h = addH != 0 ? 100 : 50;

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
        c.position({ x: childX + addW, y: childY + addH });
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

const layoutRun = (layout: any) => {
  if (cy) {
    // layout 변경하기 전에 data 를 reset 해준다. (부모- 자식 노드 관계 끊기 외)
    cyDataReset();

    cy.layout({
      ...layout,
      eles: cy.nodes().union(cy.edges())
    }).run();
  } else {
    console.error("fail");
  }
};
const setGraphLayout = (layout: object) => {
  tapReset();
  layoutRun(layout);
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

.tooltip {
  background: #fff;
  border: 1px solid #ccc;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  color: #444;
  padding: 5px;
  pointer-events: none;
  z-index: 10;
}
</style>
